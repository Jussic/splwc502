import { LightningElement, track, api  } from 'lwc';

export default class FormToggle extends LightningElement {

    
    @api recordId; 
    // track is private
    @track editMode = false;

    handleChange() {
        this.editMode =  !this.editMode; 
    }

    handleCancel() {
        this.editMode = false; 
    }

    handleSuccess() {
        this.editMode = false; 
    }
}