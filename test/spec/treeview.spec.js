'use strict';

describe('YaTreeview', function () {

    // load the module
    beforeEach(module('ya.treeview'));

    describe('service', function () {
        var httpBackend, service, vnode, options;

        beforeEach(inject(function ($httpBackend, YaTreeviewService) {
            httpBackend = $httpBackend;
            service = YaTreeviewService;

            vnode = {
                $model: {}
            };

            options = {
                childrenKey: 'children',
                collapseByDefault: true
            };
        }));

        afterEach(function () {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it('should get children if children is an array', function () {
            var expected = ['test'];
            vnode.$model[options.childrenKey] = expected;

            var actual = service.children(vnode, options);

            expect(actual).toBe(expected);
        });

        it('should get children if children is a function', function () {
            var expected = ['test'];
            vnode.$model[options.childrenKey] = function () {
                return expected;
            };

            var actual = service.children(vnode, options);

            expect(actual).toBe(expected);
        });

        it('should blow up if children is not an array nor a function', function () {
            vnode.$model[options.childrenKey] = 'test';

            expect(function () {
                service.children(vnode, options);
            }).toThrow();
        });

        it('should create a virtual node from a given node', function () {
            var parent = 'parent';
            var node = {};

            var actual = service.nodify(node, parent, options);

            expect(actual.$parent).toBe(parent);
            expect(actual.$model).toBe(node);
            expect(actual.$hasChildren).toBeFalsy();
            expect(actual.collapsed).toBe(options.collapseByDefault);
        });

        it('should expand children', function () {
            var node = {node: 'node'};
            var child = {child: 'child'};
            node[options.childrenKey] = [child];

            var actual = service.nodify(node, null, options);

            expect(actual.$model).toBe(node);
            expect(actual.$hasChildren).toBeTruthy();
            expect(actual.$children.length).toBe(1);
        });

        it('should create children as virtual nodes', function () {
            var node = {node: 'node'};
            var child = {child: 'child'};
            node[options.childrenKey] = [child];

            var actual = service.nodify(node, null, options);

            expect(actual.$children[0].$model).toBe(child);
            expect(actual.$children[0].$parent).toBe(node);
            expect(actual.$children[0].$hasChildren).toBeFalsy();
            expect(actual.$children[0].collapsed).toBe(options.collapseByDefault);
        });

        it('should create an array of virtual nodes', function () {
            var node1 = {node1: 'node1'};
            var node2 = {node2: 'node2'};
            var nodes = [node1, node2];

            var actual = service.nodifyArray(nodes, null, options);

            expect(actual.length).toBe(2);
            expect(actual[0].$model).toBe(node1);
            expect(actual[1].$model).toBe(node2);
        });
    });

    describe('controller', function () {
        var scope, ctrl;

        // Initialize the controller and a mock scope
        beforeEach(inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            scope.model = [
                {
                    label: 'parent1',
                    children: [
                        {
                            label: 'child'
                        }
                    ]
                },
                {
                    label: 'parent2',
                    children: [
                        {
                            label: 'child',
                            children: [
                                {
                                    label: 'innerChild'
                                }
                            ]
                        }
                    ]
                },
                {
                    label: 'parent3'
                }
            ];
            scope.options = {
                onExpand: jasmine.createSpy(),
                onCollapse: jasmine.createSpy(),
                onSelect: jasmine.createSpy(),
                onDblClick: jasmine.createSpy()
            };
            ctrl = $controller('YaTreeviewCtrl', {$scope: scope});
        }));

        it('should create a separate view', function () {
            expect(scope.node).not.toBe(scope.model);
        });

        it('should disallow lazy to be true and collapsed to be false', function () {
            expect(scope.node.$children[0].collapsed).toBeDefined();
            expect(scope.node.$children[0].$children[0].collapsed).toBeDefined();
        });

        it('should expand a node', function () {
            var node = scope.node.$children[0];
            node.collapsed = true;
            scope.expand({}, node);
            expect(node.collapsed).toBeFalsy();
            expect(scope.options.onExpand).toHaveBeenCalled();
        });

        it('should lazy expand a node', function () {
            var node = scope.node.$children[0];
            node.$hasChildren = true;
            node.$children = [];
            scope.expand({}, node);
            expect(node.$children.length).toBeGreaterThan(0);
        });

        it('should collapse a node', function () {
            var node = scope.node.$children[0];
            node.collapsed = false;
            scope.collapse({}, node);
            expect(node.collapsed).toBeTruthy();
            expect(scope.options.onCollapse).toHaveBeenCalled();
        });

        it('should select a node', function () {
            var node = scope.node.$children[0];
            scope.selectNode({}, node);
            expect(scope.context.selectedNode).toBe(node);
            expect(scope.options.onSelect).toHaveBeenCalled();
        });

        it('should dblClick a node', function () {
            var node = scope.node.$children[0];
            scope.dblClick({}, node);
            expect(scope.options.onDblClick).toHaveBeenCalled();
        });
    });
});