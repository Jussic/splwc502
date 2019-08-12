import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import LANG from '@salesforce/i18n/lang';
import LOCALE from '@salesforce/i18n/locale';
import CURRENCY from '@salesforce/i18n/currency';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class OppCard extends NavigationMixin(LightningElement) {

    @track openmodel = false;
    @track formattedDate;
    @track formattedAmount;
    @api name;
    @api stage;
    @api oppId;

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

    openmodal() {
        this.openmodel = true
    }
    closeModal() {
        this.openmodel = false
    } 

    viewRecord() {
        // eslint-disable-next-line no-console
        console.log(this.oppId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.oppId,
                actionName: 'view',
            },
        });
    }

    deleteRecord() {
        deleteRecord(this.oppId)
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
        console.log('handleSuccess oppCard');
        this.closeModal();
        this.dispatchEvent(new CustomEvent('success'));
    }

}