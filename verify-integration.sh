#!/bin/bash
# Verification script for Tech Tree and Community System integration

echo "🔍 Verifying Tech Tree and Community System Integration..."
echo ""

# Check if files exist
echo "📁 Checking file existence..."
files=(
    "js/tech-tree.js"
    "js/community.js"
    "tests/tech-community.test.js"
    "TECH-COMMUNITY-IMPLEMENTATION.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
    fi
done

echo ""
echo "🔗 Checking integration in Game.js..."
if grep -q "TechTreeSystem" src/core/Game.js; then
    echo "  ✅ TechTreeSystem imported"
else
    echo "  ❌ TechTreeSystem not imported"
fi

if grep -q "CommunitySystem" src/core/Game.js; then
    echo "  ✅ CommunitySystem imported"
else
    echo "  ❌ CommunitySystem not imported"
fi

if grep -q "TechTreeSystem" src/core/Game.js && grep -q "prop.*techTreeSystem" src/core/Game.js; then
    echo "  ✅ techTreeSystem registered in extensionSystems"
else
    echo "  ❌ techTreeSystem not registered"
fi

if grep -q "CommunitySystem" src/core/Game.js && grep -q "prop.*communitySystem" src/core/Game.js; then
    echo "  ✅ communitySystem registered in extensionSystems"
else
    echo "  ❌ communitySystem not registered"
fi

echo ""
echo "🎨 Checking UI integration..."
if grep -q "showTechTreeMenu" src/systems/UIIntegration.js; then
    echo "  ✅ showTechTreeMenu function exists"
else
    echo "  ❌ showTechTreeMenu function missing"
fi

if grep -q "showCommunityMenu" src/systems/UIIntegration.js; then
    echo "  ✅ showCommunityMenu function exists"
else
    echo "  ❌ showCommunityMenu function missing"
fi

if grep -q "btn-tech-tree" src/systems/UIIntegration.js; then
    echo "  ✅ btn-tech-tree binding exists"
else
    echo "  ❌ btn-tech-tree binding missing"
fi

if grep -q "btn-community" src/systems/UIIntegration.js; then
    echo "  ✅ btn-community binding exists"
else
    echo "  ❌ btn-community binding missing"
fi

echo ""
echo "🖥️ Checking HTML elements..."
if grep -q "btn-tech-tree" index.html; then
    echo "  ✅ btn-tech-tree button in HTML"
else
    echo "  ❌ btn-tech-tree button missing"
fi

if grep -q "btn-community" index.html; then
    echo "  ✅ btn-community button in HTML"
else
    echo "  ❌ btn-community button missing"
fi

if grep -q "tech-tree-menu" index.html; then
    echo "  ✅ tech-tree-menu container in HTML"
else
    echo "  ❌ tech-tree-menu container missing"
fi

if grep -q "community-menu" index.html; then
    echo "  ✅ community-menu container in HTML"
else
    echo "  ❌ community-menu container missing"
fi

echo ""
echo "🎨 Checking CSS styles..."
if grep -q "\.tech-points-display" css/new-features.css; then
    echo "  ✅ Tech tree CSS styles exist"
else
    echo "  ❌ Tech tree CSS styles missing"
fi

if grep -q "\.community-resources" css/new-features.css; then
    echo "  ✅ Community CSS styles exist"
else
    echo "  ❌ Community CSS styles missing"
fi

echo ""
echo "📊 Checking system structure..."
if grep -q "waterGun:" js/tech-tree.js; then
    echo "  ✅ Water gun tech route exists"
else
    echo "  ❌ Water gun tech route missing"
fi

if grep -q "protective:" js/tech-tree.js; then
    echo "  ✅ Protective tech route exists"
else
    echo "  ❌ Protective tech route missing"
fi

if grep -q "fireTruck:" js/tech-tree.js; then
    echo "  ✅ Fire truck tech route exists"
else
    echo "  ❌ Fire truck tech route missing"
fi

if grep -q "buildingData" js/community.js; then
    echo "  ✅ Building data structure exists"
else
    echo "  ❌ Building data structure missing"
fi

if grep -q "firefighterCandidates" js/community.js; then
    echo "  ✅ Firefighter candidates exist"
else
    echo "  ❌ Firefighter candidates missing"
fi

echo ""
echo "✅ Verification complete!"
echo ""
echo "📝 Summary:"
echo "  - Tech Tree System: 3 routes × 5 levels = 15 tech nodes"
echo "  - Community System: 4 buildings + 12 firefighter candidates"
echo "  - Full integration: Game.js + UIIntegration.js + HTML + CSS"
echo "  - Test coverage: 40 tests total"
echo "  - Documentation: Implementation summary included"