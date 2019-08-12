import { LightningElement, api, track, wire } from 'lwc';
import getPicklistValues from '@salesforce/apex/CaseStatusController.getPicklistValues';
import saveCases from '@salesforce/apex/CaseController.saveCases'; 
import getCases from '@salesforce/apex/CaseController.getCases';
import ID_FIELD from '@salesforce/schema/Case.Id'; 
import PRIORITY_FIELD from '@salesforce/schema/Case.Priority'; 
import CLOSED_DATE_FIELD from '@salesforce/schema/Case.ClosedDate'; 
import CREATED_DATE_FIELD from '@salesforce/schema/Case.CreatedDate'; 
import CASE_NUMBER_FIELD from '@salesforce/schema/Case.CaseNumber'; 
import TYPE_FIELD from '@salesforce/schema/Case.Type'; 
import OWNER_NAME_FIELD from '@salesforce/schema/Case.OwnerId'; 
import SUBJECT_FIELD from '@salesforce/schema/Case.Subject'; 
import STATUS_FIELD from '@salesforce/schema/Case.Status';

const actions = [
    { label: 'View', name: 'view' },
    { label: 'Delete', name: 'delete' },
];

const COLS = [
    { label: 'Subject', fieldName: 'Subject', editable: true },
    { label: 'Status', fieldName: 'Status', editable: false },
    { label: 'Created Date', fieldName: 'CreatedDate', editable: true, type: 'date' },
    { label: 'Close Date', fieldName: 'CloseDate', editable: true, type: 'date' },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];

export default class CaseList extends LightningElement {
    @api recordId = null;
    @track allCases;
    @api displayedCases;
    @track error;
    @api status = 'All';
    @track label = 'All';
    @track dataRetrieved = false;
    @track picklistValues;
    @track results;
    subscribed = false;
    refreshing = false;
    @track iMode = 'Tile';
    @track tileMode = true;

    @api 
    get mode() {
        return this.iMode;
    }
    set mode(value) {
        this.iMode = value;
        if (value === 'Tile') {
            this.tileMode = true;
        } else {
            this.tileMode = false;
        }
    }

    @track columns = COLS;
    @wire(getCases, {accountId: '$recordId'}) 
    wiredCases(value) {
        this.results = value;
        if (this.results.data) {
            this.allCases= this.results.data;
            this.displayedCases = this.results.data;
            this.error = undefined;
            this.dataRetrieved = true;
            this.updateList();
        } else if (this.results.error) {
            this.error = this.results.error;
            this.dataRetrieved = false;
        }
    }

    @wire(getPicklistValues) 
    wiredPicklistValues({ error, data }) {
        if (data) {
            this.picklistValues = data;
            //console.log('picklist values: ' + JSON.stringify(picklistValues)); 
        } else if (error) {
            //console.log('error retrieving picklist values '); 
            //console.log('error: ' + JSON.stringify(error));
            this.error = error;
        }
    }   

    //Handles the error
    handleError(event){
        //Error is coming in the event.detail.error
        this.error = JSON.stringify(event.detail.error);
        console.log('Error:  Is this thing on');
    }

    //Handles the message/payload from streaming api
    handleMessage(event){
        //Message is coming in event.detail.payload
        this.payload = this.payload + JSON.stringify(event.detail.payload);
        console.log('Is this thing on');
    }

    handleSave(event) {
    console.log('saving');
    const fields = {};
    fields['Id'] = event.detail.draftValues[0].Id;
    fields[NAME_FIELD.fieldApiName] = event.detail.draftValues[0].Subject;
    fields[CREATED_DATE_FIELD.fieldApiName] = event.detail.draftValues[0].CreatedDate;
    fields[CLOSE_DATE_FIELD.fieldApiName] = event.detail.draftValues[0].CloseDate;
    fields[STATUS_FIELD.fieldApiName] = event.detail.draftValues[0].Status;

    console.log('const field set');
    //const recordInput = {fields};

    const recordInputs =  event.detail.draftValues.slice().map(draft => {
        const fields = Object.assign({}, draft);
        return { fields };
    });

    console.log('calling promise');
    const promises = recordInputs.map(recordInput => updateRecord(recordInput));
    Promise.all(promises).then(cases => {
        console.log('in promise');
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Cases updated',
                variant: 'success'
            })
        );
         // Clear all draft values
         this.draftValues = [];

         // Display fresh data in the datatable
         this.updateList();
    }).catch(error => {
        // Handle error
    });

}

    handleChange(event) {
        this.status = event.detail.value;
        this.label = event.detail.label;
        console.log(this.status);
        this.updateList();
    }
    
    updateList() {        
        var filter = [];
		var k = 0;
        var i;
        var c;
        this.formattedAmount = 0;
        if (this.dataRetrieved) {
            for (i=0; i<this.allCases.length; i++){
                c = this.allCases[i];
                //check to see if it matches the filter
                if (this.status !== 'All') {
                    if (this.status === 'Open') {
                        if (!c.IsClosed) {
                            //this is open,so add it to the filter
                            filter[k] = c;
                            this.formattedAmount += c.Amount;
                            k++;
                        }
                    } else if (this.status === 'Closed') {
                        if (c.IsClosed) {
                            //this is Closed,so add it to the filter
                            filter[k] = c;
                            this.formattedAmount += c.Amount;
                            k++;
                        }
                    } else if (this.status === c.Status) {                    
                        //this is the stage filter
                        filter[k] = c;
                        this.formattedAmount += c.Amount;
                        k++; 
                    } 
                } else {
                    //total the amount
                    this.formattedAmount += c.Amount;
                    //add the entire list to the filter
                    filter = this.allCases;  
                }
            }
            this.displayedCases = filter;
            this.totalRecords = this.displayedCases.length;
        }
    }
}