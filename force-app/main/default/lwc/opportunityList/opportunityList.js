/* eslint-disable no-console */
import { LightningElement, api, track, wire } from 'lwc';
import getOpportunities from '@salesforce/apex/OpportunityController.getOpportunities'

import saveOpportunities from '@salesforce/apex/OpportunityController.saveOpportunities';
import getPicklistValues from '@salesforce/apex/OpportunityStageController.getPicklistValues';
import LOCALE from '@salesforce/i18n/locale';
import CURRENCY from '@salesforce/i18n/currency';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import NAME_FIELD from '@salesforce/schema/Opportunity.Name';
import CLOSE_DATE_FIELD from '@salesforce/schema/Opportunity.CloseDate';
import ID_FIELD from '@salesforce/schema/Opportunity.Id';
import AMOUNT_FIELD from '@salesforce/schema/Opportunity.Amount';
import STAGE_FIELD from '@salesforce/schema/Opportunity.StageName';


const actions = [
    { label: 'View', name: 'view' },
    { label: 'Delete', name: 'delete' },
];

const COLS = [
    { label: 'Name', fieldName: 'Name', editable: true },
    { label: 'Stage', fieldName: 'StageName', editable: false },
    { label: 'Amount', fieldName: 'Amount', editable: true, type: 'currency' },
    { label: 'Close Date', fieldName: 'CloseDate', editable: true, type: 'date' },
    {
        type: 'action',
        typeAttributes: { rowActions: actions },
    },
];



export default class OppList extends LightningElement {
    @api recordId = null;
    @track allOpportunities;
    @api displayedOpportunities;
    @track error;
    @api status = 'All';
    @track label = 'All';
    @track dataRetrieved = false;
    @track picklistValues;
    @track formattedAmount = 0;
    @track results;
    subscribed = false;
    refreshing = false;
    @track iMode = 'Tile';
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
    @track tileMode = true;
    @api 
    get amount() {
        const numberFormat = new Intl.NumberFormat(LOCALE, {
            style: 'currency',
            currency: CURRENCY,
            currencyDisplay: 'symbol'
        });    
        return numberFormat.format(this.formattedAmount);
    }
    set amount(value) {
        this.formattedAmount = value;
    }
    @api totalRecords;
    @track columns = COLS;
    @track draftValues = [];    
        
    @wire(getOpportunities, {accountId: '$recordId'}) 
    //wiredOpportunities({ error, data }) {
    wiredOpportunities(value) {
        this.refreshing == true;
        this.results = value;
        if (this.results.data) {
            this.allOpportunities = this.results.data;
            this.displayedOpportunities = this.results.data;
            this.error = undefined;
            this.dataRetrieved = true;
            this.updateList();
            if (this.subscribed === false) {
                this.template.querySelector('.lwc_streaming_api-1').subscribe();
                this.subscribed = true;
            }            
        } else if (this.results.error) {
            this.error = this.results.error;
            this.dataRetrieved = false;
        }
        this.refreshing = false;
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

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'delete':
                //this.deleteRow(row);
                break;
            case 'view':
                //this.showRowDetails(row);
                break;
            default:
        }
    }

    handleSave(event) {

        console.log('saving');
        const fields = {};
        //fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields['Id'] = event.detail.draftValues[0].Id;
        fields[NAME_FIELD.fieldApiName] = event.detail.draftValues[0].Name;
        fields[AMOUNT_FIELD.fieldApiName] = event.detail.draftValues[0].Amount;
        fields[CLOSE_DATE_FIELD.fieldApiName] = event.detail.draftValues[0].CloseDate;
        fields[STAGE_FIELD.fieldApiName] = event.detail.draftValues[0].StageName;

        console.log('const field set');
        //const recordInput = {fields};

        const recordInputs =  event.detail.draftValues.slice().map(draft => {
            const fields = Object.assign({}, draft);
            return { fields };
        });
    
        console.log('calling promise');
        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(opps => {
            console.log('in promise');
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Opportunities updated',
                    variant: 'success'
                })
            );
             // Clear all draft values
             this.draftValues = [];
    
             // Display fresh data in the datatable
             console.log('refresh');
             refreshApex(this.results);
             this.updateList();
             console.log('refreshed');
        }).catch(error => {
            // Handle error
        });

    }

    handleViewChange(event) {
        const selectedItemValue = event.detail.value;
        switch (selectedItemValue) {
            case 'tile':
                this.mode = 'Tile';
                break;
            case 'table':
                    this.mode = 'Table';
                break;
            default:
        }
    }

    get options() {
        return [
            { label: 'All', value: 'All' },
            { label: 'Open', value: 'Open' },
            { label: 'Closed', value: 'Closed' },
            { label: 'Closed Won', value: 'Closed Won' },
            { label: 'Closed Lost', value: 'Closed Lost' },
        ];
    }

    save(event) {
        console.log('saving');
        var update = [];
        var i = 0;
        var o;
        var oo;
        for(i=0; i < this.displayedOpportunities.length;i++) {
            o = this.displayedOpportunities[i];
            console.log(o.Amount + 1);
            oo = JSON.parse(JSON.stringify(o));
            oo.Amount = oo.Amount + 1;
            update[i] = oo;
        }
        saveOpportunities({opportunities: JSON.stringify(update)})
            .then(result => {
                //this.contacts = result;
                console.log('saved');
                this.doRefresh();
            })
            .catch(error => {
                //this.error = error;
                console.log('error');
                console.log(JSON.stringify(error));
            });
    }

    handleMessage(event) {
        console.log('Event received in oppList: ');
        //var id = JSON.stringify(event.detail.payload.data.sobject.AccountId);
        var id = event.detail.payload.data.sobject.AccountId;
        console.log(id);
        console.log(this.recordId);
        //check to see if the message we got is related to this account
        if (id === this.recordId) {
            //it's a match, so refresh the data
            console.log('refreshing data');
            refreshApex(this.results);
            
        }        
    }

    doRefresh() {
        //if (this.refreshing === false) {
            refreshApex(this.results);
        //}
    }

    handleSuccess(event) {
        console.log('handleSuccess oppList');
        this.doRefresh();
    }

    handleDelete(event) {
        this.doRefresh();
    }

    refresh(event) {
        this.doRefresh();
    }

    handleChange(event) {
        this.status = event.detail.value;
        this.label = event.detail.label;
        //console.log(this.status);
        this.updateList();
    }

    updateList() {        
        var filter = [];
		var k = 0;
        var i;
        var o;
        this.formattedAmount = 0;
        if (this.dataRetrieved) {
            for (i=0; i<this.allOpportunities.length; i++){
                o = this.allOpportunities[i];
                //check to see if it matches the filter
                //console.log('StageName ' + o.StageName + ' Status: ' + this.status);
                if (this.status !== 'All') {
                    if (this.status === 'Open') {
                        if (!o.IsClosed) {
                            //this is open,so add it to the filter
                            filter[k] = o;
                            this.formattedAmount += o.Amount;
                            k++;
                        }
                    } else if (this.status === 'Closed') {
                        if (o.IsClosed) {
                            //this is Closed,so add it to the filter
                            filter[k] = o;
                            this.formattedAmount += o.Amount;
                            k++;
                        }
                    } else if (this.status === o.StageName) {                    
                        //this is the stage filter
                        filter[k] = o;
                        this.formattedAmount += o.Amount;
                        k++; 
                    } 
                } else {
                    //total the amount
                    this.formattedAmount += o.Amount;
                    //add the entire list to the filter
                    filter = this.allOpportunities;  
                }
            }
            this.displayedOpportunities = filter;
            this.totalRecords = this.displayedOpportunities.length;
        }
    }
    
}