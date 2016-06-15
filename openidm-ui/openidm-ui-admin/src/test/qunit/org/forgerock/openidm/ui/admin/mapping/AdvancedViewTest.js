define([
    "lodash",
    "org/forgerock/openidm/ui/admin/mapping/AdvancedView"
], function (_, AdvancedView) {
    var mapping = {
            "name": "systemLdapAccounts_managedUser",
            "source": "system/ldap/account",
            "target": "managed/user"
        },
        formData = {
            "correlateEmptyTargetSet": false,
            "prefetchLinks": false
        };

    QUnit.module('AdvancedView #mutateMapping');

    QUnit.test("#mutateMapping", function(assert) {
        var mutateMapping = AdvancedView.mutateMapping,
            originalMapping = _.clone(mapping),
            expectedMapping,
            mutatedMapping,
            mergeMapping,
            mergeFormData;

        // When the ui is rendered all boolean fields are read by the view they are set to false
        mergeFormData = _.clone(formData);

        // mutated mapping should therefore be the same as the original mapping
        originalMapping = _.clone(mapping);
        mutatedMapping = mutateMapping(originalMapping, mergeFormData);

        assert.deepEqual(
            mutatedMapping,
            originalMapping,
            "#mutateMapping: does not add falsy values to mapping if not already defined"
        );

        // #mutatedMapping: deletes false values from mapping to restore default
        expectedMapping = _.clone(mapping);
        mergeMapping = _.clone(mapping);

        mergeMapping.correlateEmptyTargetSet = true;
        expectedMapping.correlateEmptyTargetSet = false;

        mutatedMapping = mutateMapping(mergeMapping, mergeFormData);

        assert.ok(
            _.isUndefined(mutatedMapping.correlateEmptyTargetSet),
            "#mutatedMapping: deletes falsy values from mapping if deactivated by the user"
        );

        // Add user enabled values"
        expectedMapping = _.clone(mapping);
        mergeFormData = _.clone(formData);

        mergeFormData.correlateEmptyTargetSet = true;
        mutatedMapping = mutateMapping(mapping, mergeFormData);

        assert.ok(
            mutatedMapping &&
            mutatedMapping.correlateEmptyTargetSet === true,
            "#mutatedMapping: properly adds user enabled fields"
        );


        // Task threads should be properly added for non-zero values
        mergeFormData = _.clone(formData);
        mergeMapping = _.clone(mapping);

        mergeFormData.taskThreads = 20;
        mutatedMapping = mutateMapping(mergeMapping, mergeFormData);

        assert.ok(
            mutatedMapping.taskThreads &&
            mutatedMapping.taskThreads === 20,
            "#mutatedMapping: Task threads should be properly added for non-zero values"
        );

        // Task threads should be properly edited for non-zero values
        mergeFormData = _.clone(formData);
        mergeMapping = _.clone(mapping);

        mergeFormData.taskThreads = 20;
        mergeMapping.taskThreads = 15;

        mutatedMapping = mutateMapping(mergeMapping, mergeFormData);

        assert.ok(
            mutatedMapping.taskThreads &&
            mutatedMapping.taskThreads === 20,
            "#mutatedMapping: Task threads should be properly edited for non-zero values"
        );


        // Task threads should be properly set to zero
        mergeFormData = _.clone(formData);
        mergeMapping = _.clone(mapping);

        mergeFormData.taskThreads = 0;
        mutatedMapping = mutateMapping(mergeMapping, mergeFormData);

        assert.ok(
            mutatedMapping.hasOwnProperty("taskThreads") &&
            mutatedMapping.taskThreads === 0,
            "#mutatedMapping: Task threads should be properly set to zero"
        );


        // Task threads set to 10 will be deleted from mapping (default mapping obj)"
        mergeFormData = _.clone(formData);
        mergeMapping = _.clone(mapping);

        mergeFormData.taskThreads = 10;
        mutatedMapping = mutateMapping(mergeMapping, mergeFormData);

        assert.ok(
            _.isUndefined(mutatedMapping.taskThreads),
            "#mutatedMapping: Task threads set to 10 will be deleted from mapping (default mapping obj)"
        );

    });

    // // Add tests for my object creator
    QUnit.module('AdvancedView #createUiObj');
    QUnit.test("#createUiObj: Param", function(assert) {

        var createUiObj = AdvancedView.createUiObj,
            param = createUiObj.call(AdvancedView, "param", {name: "correlateEmptyTargetSet", fieldType: "boolean"}),
            panel = createUiObj.call(AdvancedView, "panel", {name: "additionalOptions", mapping: mapping, helpLink: "#reconciliation-optimization", description: true, params: [ param ]});

        // Param Object
        [
            {name: "helpText",  val: ""},
            {name:"name", val:"correlateEmptyTargetSet"},
            {name:"panelId", val:"#additionalOptionsPanel"},
            {name:"title", val:"Correlate Emtpy Target Objects"}
        ].map(function(prop) {
            assert.ok(param.hasOwnProperty(prop.name), "param properties: names");
            assert.equal(param[prop.name], prop.val, "param properties: values");
        });

        [
            {name: "getClean", val: "additionalOptionsPanel", args: 'panelId'},
            {name: "partial", val: "mapping/advanced/_booleanPartial", args: null}
        ].map(function(prop) {
            assert.ok(param.hasOwnProperty(prop.name), "param methods: names");
            assert.equal(typeof param[prop.name], "function", "param methods: are methods");
            assert.equal(param[prop.name](prop.args), prop.val, "param methods: return vals");
        });


    });

});
