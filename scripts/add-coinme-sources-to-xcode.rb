#!/usr/bin/env ruby
# frozen_string_literal: true

# scripts/add-coinme-sources-to-xcode.rb
#
# Idempotent: registers the PayAiroCoinmeRiskModule native files with the
# `payAiro` Xcode target so they are compiled into the app binary.
#
# Why a script rather than manual Xcode GUI:
#   - Deterministic & reviewable (diff of project.pbxproj on commit)
#   - Safe to re-run (no-op if files are already registered correctly)
#   - Works for every developer and CI without Xcode interaction
#
# IMPORTANT — project-specific quirk:
# The `payAiro` PBXGroup in this project is a *logical* group: it has
#   `name = payAiro`, `sourceTree = <group>`, but NO `path`.
# That means each child file reference must encode the `payAiro/` subfolder
# prefix in its `path` attribute (e.g. `path = payAiro/Foo.swift`), and set
# `name` separately to just the filename. The existing
# `PayAiroQRScannerModule.*` entries follow this pattern; we match it.
#
# Usage:
#   cd payAiro-app
#   bundle exec ruby scripts/add-coinme-sources-to-xcode.rb

require 'xcodeproj'

PROJECT_PATH = File.expand_path('../ios/payAiro.xcodeproj', __dir__)
TARGET_NAME  = 'payAiro'
GROUP_NAME   = 'payAiro'
SUBFOLDER    = 'payAiro'
FILES        = %w[PayAiroCoinmeRiskModule.swift PayAiroCoinmeRiskModule.m].freeze

abort "Project not found at #{PROJECT_PATH}" unless File.directory?(PROJECT_PATH)

project = Xcodeproj::Project.open(PROJECT_PATH)
target  = project.targets.find { |t| t.name == TARGET_NAME } or
  abort "Target '#{TARGET_NAME}' not found in #{PROJECT_PATH}"
group   = project.main_group.find_subpath(GROUP_NAME, false) or
  abort "Group '#{GROUP_NAME}' not found in project main group"

sources_phase = target.source_build_phase

dirty = false
FILES.each do |filename|
  expected_path = "#{SUBFOLDER}/#{filename}"

  # Match either by sub-path (correct form) OR by bare filename (the form
  # the earlier version of this script produced).
  file_ref = group.files.find do |f|
    f.path == expected_path || f.path == filename ||
      (f.name && f.name == filename)
  end

  if file_ref
    if file_ref.path != expected_path
      file_ref.path = expected_path
      file_ref.name = filename
      dirty = true
      puts "• #{filename}: fixed path -> #{expected_path}"
    end
  else
    file_ref = group.new_file(expected_path)
    file_ref.name = filename
    dirty = true
    puts "• #{filename}: registered at #{expected_path}"
  end

  if sources_phase.files_references.include?(file_ref)
    puts "    already in #{TARGET_NAME} Sources build phase"
  else
    sources_phase.add_file_reference(file_ref)
    dirty = true
    puts "    added to #{TARGET_NAME} Sources build phase"
  end
end

if dirty
  project.save
  puts "project.pbxproj saved."
else
  puts "No changes — project.pbxproj not rewritten."
end
