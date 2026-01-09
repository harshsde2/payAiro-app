#!/bin/bash

# Script to check 16KB compatibility from AAB file (Google Play format)
# This checks the exact .so files that Google Play will deliver

AAB_PATH="android/app/build/outputs/bundle/productionRelease/app-production-release.aab"

# Check if bundletool is available
if ! command -v bundletool &> /dev/null; then
    echo "❌ bundletool not found!"
    echo "Install it with: brew install bundletool"
    exit 1
fi

# Create temp directory
TEMP_DIR=$(mktemp -d)
echo "📦 Working directory: $TEMP_DIR"
echo ""

# Step 1: Generate APKs from AAB using bundletool
echo "Step 1: Generating APKs from AAB using bundletool..."
APKS_FILE="$TEMP_DIR/app.apks"
bundletool build-apks \
    --bundle="$AAB_PATH" \
    --output="$APKS_FILE" \
    --mode=universal

if [ ! -f "$APKS_FILE" ]; then
    echo "❌ Failed to generate APKs from AAB"
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "✅ APKs generated"
echo ""

# Step 2: Extract APKs
echo "Step 2: Extracting APKs..."
APKS_DIR="$TEMP_DIR/apks"
unzip -q "$APKS_FILE" -d "$APKS_DIR"

# Find universal.apk or base.apk
UNIVERSAL_APK="$APKS_DIR/universal.apk"
BASE_APK="$APKS_DIR/splits/base.apk"

if [ -f "$UNIVERSAL_APK" ]; then
    APK_TO_EXTRACT="$UNIVERSAL_APK"
elif [ -f "$BASE_APK" ]; then
    APK_TO_EXTRACT="$BASE_APK"
else
    echo "❌ Could not find APK in extracted files"
    echo "Available files:"
    find "$APKS_DIR" -name "*.apk" -type f
    rm -rf "$TEMP_DIR"
    exit 1
fi

echo "✅ Found APK: $(basename $APK_TO_EXTRACT)"
echo ""

# Step 3: Extract APK contents
echo "Step 3: Extracting APK contents..."
APK_EXTRACT_DIR="$TEMP_DIR/apk_extract"
unzip -q "$APK_TO_EXTRACT" -d "$APK_EXTRACT_DIR"

echo "✅ APK extracted"
echo ""

# Step 4: Check .so files alignment
echo "=========================================="
echo "Checking 16KB Page Size Compatibility"
echo "From Google Play AAB file"
echo "=========================================="
echo ""

for ARCH_DIR in "$APK_EXTRACT_DIR/lib"/*; do
    if [ -d "$ARCH_DIR" ]; then
        ARCH=$(basename "$ARCH_DIR")
        echo "📱 Architecture: $ARCH"
        echo "----------------------------------------"
        
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
                p_align = struct.unpack('<Q', ph[40:48])[0]
            
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
                        else
                            echo "  ✅ $LIB_NAME - Alignment: $ALIGNMENT ($ALIGN_DEC bytes) - 16KB compatible"
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
    fi
done

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
NON_COMPLIANT=$(grep "❌" <<< "$(cat)" | wc -l | tr -d ' ')
COMPLIANT=$(grep "✅" <<< "$(cat)" | wc -l | tr -d ' ')
echo "Non-compliant libraries: $NON_COMPLIANT"
echo "Compliant libraries: $COMPLIANT"
echo ""

# Cleanup
rm -rf "$TEMP_DIR"
echo "Done!"
