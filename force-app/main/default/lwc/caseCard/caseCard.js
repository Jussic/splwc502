import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import LANG from '@salesforce/i18n/lang';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CaseCard extends NavigationMixin(LightningElement) {

    @track openmodel = false;
    @track formattedDate;
    @track formattedOpenDate;
    @api subject;
    @api status;
    @api caseId;
    

    @api 
    get closeDate() {
        const dateTimeFormat = new Intl.DateTimeFormat(LANG);
        this.formattedDate = new Date(this.formattedDate);
        return dateTimeFormat.format(this.formattedDate);
    }
    set closeDate(value) {
        this.formattedDate = value;
    }

    @api
    get createdDate() {
        const dateTimeOpenFormat = new Intl.DateTimeFormat(LANG);
        this.formattedOpenDate = new Date(this.formattedOpenDate);
        return dateTimeOpenFormat.format(this.formattedOpenDate);
    }
    set createdDate(value) {
        this.formattedOpenDate = value;
    }
   
    openmodal() {
        this.openmodel = true
    }
    closeModal() {
        this.openmodel = false
    } 

    viewRecord() {
        // eslint-disable-next-line no-console
        console.log(this.caseId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.caseId,
                actionName: 'view',
            },
        });
    }

    deleteRecord() {
        deleteRecord(this.caseId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record Is  Deleted',
                        variant: 'success',
                    }),
                );
                this.dispatchEvent(new CustomEvent('delete'));
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error While Deleting record',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
    }

    handleSuccess(event) {
        console.log('handleSuccess caseCard');
        this.closeModal();
        this.dispatchEvent(new CustomEvent('success'));
    }

    handleCancel(event) {
        console.log('handleCancel caseCard');
        this.closeModal();
        this.dispatchEvent(new CustomEvent('cancel'));
    }

}