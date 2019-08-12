import { LightningElement, api, track} from 'lwc';

export default class CaseRecordForm extends LightningElement {

    @api recordId; 
    @api mode = 'view';

    handleCancel() {
        this.dispatchEvent(new CustomEvent('cancel')); 
    }

    handleSuccess() {
        this.dispatchEvent(new CustomEvent('success')); 
    }

    
}