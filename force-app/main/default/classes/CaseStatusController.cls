global class CaseStatusController extends VisualEditor.DynamicPickList {

    global override VisualEditor.DataRow getDefaultValue(){
        VisualEditor.DataRow defaultValue = new VisualEditor.DataRow('All', 'All');
        return defaultValue;
    }    
    
    global override VisualEditor.DynamicPickListRows getValues() {
        
        VisualEditor.DynamicPickListRows options = 
        new VisualEditor.DynamicPickListRows();        
        options.addRow(new VisualEditor.DataRow('All', 'All'));
        Schema.DescribeFieldResult fieldResult = Case.Status.getDescribe();
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
        //go find the stage picklist and get the values from it
        Schema.DescribeFieldResult fieldResult = Case.Status.getDescribe();
        List<Schema.PicklistEntry> entries = fieldResult.getPicklistValues();
       	for(Schema.PicklistEntry f : entries)
        {
            values.add(new PicklistValue(f.getValue(), f.getLabel()));
        }          
        return values;                                  
    }
    
}
