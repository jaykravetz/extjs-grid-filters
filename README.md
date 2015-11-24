# extjs-grid-filters
Plugin for grid filters for ExtJs 5/6

Based on the FilterBar plugin.

## Usage

```javascript

// Grid Panel

require: [
  'FilterField.filters.Filter'
],

plugins: [
  ptype: 'filterfield'
],

columns: [
  {
    xtype: 'gridcolumn',
    text: 'Some Column',
    dataIndex: 'some_data_index',
    filter: {
      xtype: 'combobox',
      store: ['A', List', 'Of', 'Selections']
    }
  }
]
```
