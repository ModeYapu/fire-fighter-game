/**
 * Test for Tech Tree and Community System Integration
 */

import { TechTreeSystem } from '../js/tech-tree.js';
import { CommunitySystem } from '../js/community.js';

describe('Tech Tree System Integration', () => {
    let game;
    let techTree;

    beforeEach(() => {
        game = {
            addTechPoints: jest.fn()
        };
        techTree = new TechTreeSystem(game);
    });

    test('should initialize with default values', () => {
        expect(techTree.techPoints).toBe(0);
        expect(techTree.unlockedTechs).toEqual([]);
        expect(Object.keys(techTree.techTree)).toHaveLength(3);
    });

    test('should have 3 tech routes', () => {
        expect(techTree.techTree.waterGun).toBeDefined();
        expect(techTree.techTree.protective).toBeDefined();
        expect(techTree.techTree.fireTruck).toBeDefined();
    });

    test('each route should have 5 levels', () => {
        Object.values(techTree.techTree).forEach(route => {
            expect(route.levels).toHaveLength(5);
        });
    });

    test('should unlock tech when affordable', () => {
        techTree.addTechPoints(100);
        expect(techTree.canUnlock('water-1')).toBe(true);
        expect(techTree.unlockTech('water-1')).toBe(true);
        expect(techTree.unlockedTechs).toContain('water-1');
    });

    test('should not unlock tech without points', () => {
        expect(techTree.canUnlock('water-1')).toBe(true);
        expect(techTree.unlockTech('water-1')).toBe(false);
        expect(techTree.unlockedTechs).not.toContain('water-1');
    });

    test('should require prerequisite tech', () => {
        techTree.addTechPoints(200);
        expect(techTree.canUnlock('water-2')).toBe(false);
        techTree.unlockTech('water-1');
        expect(techTree.canUnlock('water-2')).toBe(true);
    });

    test('should calculate active effects', () => {
        techTree.addTechPoints(200);
        techTree.unlockTech('water-1');
        techTree.unlockTech('water-2');

        const effects = techTree.activeEffects;
        expect(effects.waterRange).toBe(10);
        expect(effects.waterPower).toBe(15);
    });

    test('should save and load tech points', () => {
        techTree.addTechPoints(100);
        const saved = techTree.techPoints;

        const newTechTree = new TechTreeSystem(game);
        expect(newTechTree.techPoints).toBe(saved);
    });

    test('should render tech tree UI', () => {
        const container = document.createElement('div');
        techTree.renderTechTreeUI(container);

        expect(container.querySelector('.tech-points-display')).toBeTruthy();
        expect(container.querySelectorAll('.tech-route').length).toBe(3);
        expect(container.querySelectorAll('.tech-level').length).toBe(15);
    });
});

describe('Community System Integration', () => {
    let game;
    let community;

    beforeEach(() => {
        game = {};
        community = new CommunitySystem(game);
    });

    test('should initialize with default resources', () => {
        expect(community.resources.gold).toBe(1000);
        expect(community.resources.materials).toBe(100);
        expect(community.resources.reputation).toBe(0);
    });

    test('should have 4 building types', () => {
        expect(community.buildingData.fireStation).toBeDefined();
        expect(community.buildingData.trainingCenter).toBeDefined();
        expect(community.buildingData.warehouse).toBeDefined();
        expect(community.buildingData.garage).toBeDefined();
    });

    test('should have firefighter candidates', () => {
        expect(community.firefighterCandidates.length).toBeGreaterThan(0);
        expect(community.firefighterCandidates[0]).toHaveProperty('name');
        expect(community.firefighterCandidates[0]).toHaveProperty('stats');
    });

    test('should recruit firefighter when affordable', () => {
        const candidate = community.firefighterCandidates[0];
        const initialGold = community.resources.gold;

        community.recruitFirefighter(candidate.id);

        expect(community.firefighters.length).toBe(1);
        expect(community.resources.gold).toBe(initialGold - candidate.cost);
    });

    test('should not recruit without enough gold', () => {
        community.resources.gold = 0;
        const candidate = community.firefighterCandidates[0];

        const result = community.recruitFirefighter(candidate.id);

        expect(result).toBe(false);
        expect(community.firefighters.length).toBe(0);
    });

    test('should respect firefighter limit', () => {
        // Set max firefighters to 2
        community.buildings.fireStation = 1;

        // Try to recruit more than limit
        community.firefighterCandidates.slice(0, 3).forEach(c => {
            community.recruitFirefighter(c.id);
        });

        expect(community.firefighters.length).toBeLessThanOrEqual(2);
    });

    test('should upgrade building when affordable', () => {
        community.resources.gold = 1000;
        community.resources.materials = 100;

        const result = community.upgradeBuilding('fireStation');

        expect(result).toBe(true);
        expect(community.buildings.fireStation).toBe(2);
    });

    test('should not upgrade without resources', () => {
        community.resources.gold = 0;
        community.resources.materials = 0;

        const result = community.upgradeBuilding('fireStation');

        expect(result).toBe(false);
        expect(community.buildings.fireStation).toBe(1);
    });

    test('should calculate resource bonus', () => {
        community.buildings.warehouse = 2;
        const bonus = community.calculateResourceBonus();

        expect(bonus).toBe(0.25);
    });

    test('should calculate daily production', () => {
        const goldProduction = community.calculateDailyProduction('gold');
        const materialsProduction = community.calculateDailyProduction('materials');

        expect(goldProduction).toBeGreaterThan(0);
        expect(materialsProduction).toBeGreaterThan(0);
    });

    test('should collect daily resources', () => {
        const initialGold = community.resources.gold;
        const initialMaterials = community.resources.materials;

        community.collectDailyResources();

        expect(community.resources.gold).toBeGreaterThan(initialGold);
        expect(community.resources.materials).toBeGreaterThan(initialMaterials);
    });

    test('should render community UI', () => {
        const container = document.createElement('div');
        community.renderCommunityUI(container);

        expect(container.querySelector('.community-resources')).toBeTruthy();
        expect(container.querySelector('.community-tabs')).toBeTruthy();
        expect(container.querySelectorAll('.community-tab').length).toBe(3);
    });

    test('should add resources', () => {
        const initialGold = community.resources.gold;

        community.addResource('gold', 500);

        expect(community.resources.gold).toBe(initialGold + 500);
    });

    test('should add reputation', () => {
        const initialReputation = community.resources.reputation;

        community.addReputation(100);

        expect(community.resources.reputation).toBe(initialReputation + 100);
    });

    test('should save and load resources', () => {
        community.resources.gold = 5000;
        community.saveResources();

        const newCommunity = new CommunitySystem(game);

        expect(newCommunity.resources.gold).toBe(5000);
    });

    test('should save and load buildings', () => {
        community.buildings.fireStation = 3;
        community.saveBuildings();

        const newCommunity = new CommunitySystem(game);

        expect(newCommunity.buildings.fireStation).toBe(3);
    });

    test('should save and load firefighters', () => {
        const candidate = community.firefighterCandidates[0];
        community.recruitFirefighter(candidate.id);
        community.saveFirefighters();

        const newCommunity = new CommunitySystem(game);

        expect(newCommunity.firefighters.length).toBe(1);
        expect(newCommunity.firefighters[0].name).toBe(candidate.name);
    });
});