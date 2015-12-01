Ext.define('FilterField.filters.Filter', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.filterfield',

    require: [
        'FilterField.button.OperatorButton'
    ],


    /**
     * @param {string}  The key to the configs added to a grid column
     */
    activateKey: 'filter',


    /**
     * @param {Ext.util.DelayedTask}
     * @protected
     */
    _task: Ext.create('Ext.util.DelayedTask'),


    /**
     * @param {number}  The number of milliseconds to delay
     */
    delay: 800,


    /**
     * Constructor
     * All args passed in are from configs when adding the plugin to the grid
     *
     * @param   {Object}    configs
     */
    constructor: function(configs) {

        this.activateKey = configs.activateKey || this.activateKey;
        this.delay = configs.delay || this.delay;

        this.callParent(arguments);
    },


    /**
     * Init function
     * This function is called when the plugin is invoked by the Owner component
     *
     * @param   {Ext.grid.Panel}    grid
     */
    init: function(grid) {

        var me = this,
            columns = grid.columns;

        Ext.Array.each(columns, function(column) {

            var filter = {};

            if ( ! column[me.activateKey])
                return true; // Returning false breaks. Wat?

            if ( ! column.items)
                Ext.apply(column, { items: [] });

            column.filter = column[me.activateKey];

            Ext.apply(filter, column.filter, {
                width: '100%',
                triggers: {
                    clear: {
                        cls: 'x-form-clear-trigger',
                        hidden: true,
                        handler: function () {
                            this.setValue(null);

                            if (typeof this.clearValue === 'function')
                                this.clearValue();
                        }
                    }
                },
                listeners: {
                    change: {
                        fn: function (field) {
                            var fn = (Ext.isEmpty(field.getValue())) ? me.clearFilter : me.applyFilter;
                            me._task.delay(me.delay, fn, me, [field]);
                        }
                    }
                }
            });

            if (me.needsOperatorButton(column)) {
                Ext.apply(filter, me.getOperatorButtonPlugin());
            }

            column.insert(0, Ext.create('Ext.container.Container', {
                width: '100%',
                items: [filter],
                listeners: {
                    scope: me,
                    element: 'el',
                    mousedown: function(e) { e.stopPropagation(); },
                    click: function(e) { e.stopPropagation(); },
                    dblclick: function(e) { e.stopPropagation(); },
                    keydown: function(e) { e.stopPropagation(); },
                    keypress: function(e) { e.stopPropagation(); },
                    keyup: function(e) { e.stopPropagation(); }
                }
            }));

        });

    },


    /**
     * Check if a column needs an Operator Button
     *
     * @param   {Ext.grid.Column} column
     * @returns {boolean}
     */
    needsOperatorButton: function(column) {
        return (column.filter.xtype == 'numberfield' || column.filter.xtype == 'datefield');
    },


    /**
     * Get the default filter operator for a column
     *
     * @param   {Ext.grid.Column}   column
     * @returns {string}
     */
    getDefaultOperator: function(column) {
        if (column.filter.xtype == 'textfield')
            return 'like';

        if (column.filter.xtype == 'combobox')
            return 'in';

        return 'eq';
    },


    /**
     * Get the configs for the OperatorButton plugin
     *
     * @returns {Object}
     */
    getOperatorButtonPlugin: function() {
        return {
            plugins: {
                ptype: 'operatorbutton',
                texteq: 'Equal to',
                textne: 'Does not equal',
                textgte: 'Greater than or equal',
                textlte: 'Less Than or equal to',
                textgt: 'Greater than',
                textlt: 'Less than',
                listeners: {
                    operatorchanged: function(field) {
                        field.fireEvent('change', field);
                    }
                }
            }
        }
    },


    /**
     * Clear a filter from the grid's underlying store
     *
     * @param   {Ext.form.field.Field}  field
     */
    clearFilter: function(field) {

        var column = field.ownerCt.ownerCt,
            grid = column.up('grid');

        grid.getStore().removeFilter(column.filter.property || column.dataIndex);
        field.triggers.clear.el.hide();
        column.setText(column.textEl.dom.firstElementChild.innerText);
    },


    /**
     * Apply a filter on the grid's underlying store
     *
     * @param   {Ext.form.field.Field}  field
     */
    applyFilter: function (field) {

        var me = this,
            column = field.ownerCt.ownerCt,
            grid = column.up('grid');

        field.triggers.clear.el.show();

        column.setText('<strong><em>' + column.text + '</em></strong>');

        grid.getStore().addFilter({
            property: column.filter.property || column.dataIndex,
            operator: field.operator || column.filter.operator || me.getDefaultOperator(column),
            value: field.getValue()
        });
    }
});
