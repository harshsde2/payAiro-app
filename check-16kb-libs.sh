#!/bin/bash

# Navigate to your APK location
APK_PATH="android/app/build/outputs/apk/production/release/app-production-release.apk"
# Or for AAB, extract it first:
# AAB_PATH="android/app/build/outputs/bundle/productionRelease/app-production-release.aab"

# Create temp directory
TEMP_DIR=$(mktemp -d)
echo "Extracting APK to: $TEMP_DIR"

# Extract APK (it's a zip file)
unzip -q "$APK_PATH" -d "$TEMP_DIR"

# Check each architecture
echo "=========================================="
echo "Checking 16KB Page Size Compatibility"
echo "=========================================="
echo ""

for ARCH_DIR in "$TEMP_DIR/lib"/*; do
    if [ -d "$ARCH_DIR" ]; then
        ARCH=$(basename "$ARCH_DIR")
        echo "📱 Architecture: $ARCH"
        echo "----------------------------------------"
        NON_COMPLIANT_COUNT=0
        COMPLIANT_COUNT=0
        
        for SO_FILE in "$ARCH_DIR"/*.so; do
            if [ -f "$SO_FILE" ]; then
                LIB_NAME=$(basename "$SO_FILE")
                
                # Check alignment using Python (works on macOS)
                if command -v python3 &> /dev/null; then
                    # Use Python to check ELF alignment
                    ALIGNMENT=$(python3 << EOF
import struct
import sys

try:
    with open("$SO_FILE", "rb") as f:
        # Read ELF header
        elf_header = f.read(64)
        
        # Check ELF magic number
        if elf_header[:4] != b'\x7fELF':
            sys.exit(1)
        
        # Get ELF class (32-bit or 64-bit)
        elf_class = elf_header[4]
        
        # Read program headers to find minimum alignment
        if elf_class == 1:  # 32-bit
            e_phoff = struct.unpack('<I', elf_header[28:32])[0]
            e_phentsize = struct.unpack('<H', elf_header[42:44])[0]
            e_phnum = struct.unpack('<H', elf_header[44:46])[0]
        else:  # 64-bit
            e_phoff = struct.unpack('<Q', elf_header[32:40])[0]
            e_phentsize = struct.unpack('<H', elf_header[54:56])[0]
            e_phnum = struct.unpack('<H', elf_header[56:58])[0]
        
        f.seek(e_phoff)
        min_align = 0x10000  # Start with 64KB as default
        
        for i in range(e_phnum):
            ph = f.read(e_phentsize)
            if len(ph) < e_phentsize:
                break
            
            if elf_class == 1:  # 32-bit
                p_type = struct.unpack('<I', ph[0:4])[0]
                p_align = struct.unpack('<I', ph[28:32])[0]
            else:  # 64-bit
                p_type = struct.unpack('<I', ph[0:4])[0]
                # Elf64_Phdr layout ends with p_align at bytes 48..56
                p_align = struct.unpack('<Q', ph[48:56])[0]
            
            # PT_LOAD = 1
            if p_type == 1 and p_align > 0:
                if min_align == 0x10000 or p_align < min_align:
                    min_align = p_align
        
        # Check if alignment is >= 16384 (16KB)
        if min_align >= 16384:
            print(f"0x{min_align:x}")
        else:
            print(f"0x{min_align:x}")
except:
    sys.exit(1)
EOF
)
                    
                    if [ ! -z "$ALIGNMENT" ] && [ "$ALIGNMENT" != "" ]; then
                        # Convert hex to decimal
                        ALIGN_DEC=$((ALIGNMENT))
                        if [ "$ALIGN_DEC" -lt 16384 ]; then
                            echo "  ❌ $LIB_NAME - Alignment: $ALIGNMENT ($ALIGN_DEC bytes) - NOT 16KB compatible"
                            NON_COMPLIANT_COUNT=$((NON_COMPLIANT_COUNT + 1))
                        else
                            echo "  ✅ $LIB_NAME - Alignment: $ALIGNMENT ($ALIGN_DEC bytes) - 16KB compatible"
                            COMPLIANT_COUNT=$((COMPLIANT_COUNT + 1))
                        fi
                    else
                        echo "  ⚠️  $LIB_NAME - Could not determine alignment"
                    fi
                else
                    # Fallback: just list the file
                    echo "  📄 $LIB_NAME (Python3 not available for alignment check)"
                fi
            fi
        done
        echo ""
        echo "  ➜ $ARCH summary: ✅ $COMPLIANT_COUNT compliant, ❌ $NON_COMPLIANT_COUNT non-compliant"
        echo ""
    fi
done

# Cleanup
rm -rf "$TEMP_DIR"
echo "Done!"
