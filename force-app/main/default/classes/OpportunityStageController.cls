global class OpportunityStageController extends VisualEditor.DynamicPickList {

    global override VisualEditor.DataRow getDefaultValue(){
        VisualEditor.DataRow defaultValue = new VisualEditor.DataRow('All', 'All');
        return defaultValue;
    }    
    
    global override VisualEditor.DynamicPickListRows getValues() {
        
        VisualEditor.DynamicPickListRows options = 
        new VisualEditor.DynamicPickListRows();        
        options.addRow(new VisualEditor.DataRow('All', 'All'));
        options.addRow(new VisualEditor.DataRow('Open', 'Open'));
        options.addRow(new VisualEditor.DataRow('Closed', 'Closed'));
        Schema.DescribeFieldResult fieldResult = Opportunity.StageName.getDescribe();
        List<Schema.PicklistEntry> entries = fieldResult.getPicklistValues();
        for(Schema.PicklistEntry f : entries)
        {
            options.addRow(new VisualEditor.DataRow(f.getLabel(), f.getValue()));
        } 
        return options;
    }

    public class PicklistValue {
        @AuraEnabled public string label, value;        
        PicklistValue(String val, String lab) {
            label = lab;
            value = val;
        }
    }

    @AuraEnabled(cacheable=true)
    public static PicklistValue[] getPicklistValues(String objectName, String fieldName) {
       	List<PicklistValue> values = new List<PicklistValue>();
        values.add(new PicklistValue('All', 'All'));
        values.add(new PicklistValue('Open', 'Open'));
        values.add(new PicklistValue('Closed', 'Closed'));
        //go find the stage picklist and get the values from it
        Schema.DescribeFieldResult fieldResult = Opportunity.StageName.getDescribe();
        List<Schema.PicklistEntry> entries = fieldResult.getPicklistValues();
       	for(Schema.PicklistEntry f : entries)
        {
            values.add(new PicklistValue(f.getValue(), f.getLabel()));
        }          
        return values;                                  
    }
}