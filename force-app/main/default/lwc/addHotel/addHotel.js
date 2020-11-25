import { LightningElement, wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { showToastedMessage } from 'c/utils';
import { refreshApex } from '@salesforce/apex';
import getHotels from '@salesforce/apex/AccountController.getHotels';
import getHotelRecordTypeId from '@salesforce/apex/AccountController.getHotelRecordTypeId';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import RECORD_TYPE_ID_FIELD from '@salesforce/schema/Account.RecordTypeId';
import STREET_FIELD from '@salesforce/schema/Account.BillingStreet';
import CITY_FIELD from '@salesforce/schema/Account.BillingCity';
import STATE_FIELD from '@salesforce/schema/Account.BillingState';
import POSTAL_CODE_FIELD from '@salesforce/schema/Account.BillingPostalCode';
import COUNTRY_FIELD from '@salesforce/schema/Account.BillingCountry';
import PICTURE_FIELD from '@salesforce/schema/Account.Picture__c';


export default class AddHotel extends LightningElement {
    formFields = this.initFields();

    initFields() {
        return {
            recordTypeId: '',
            name: '',
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            picture: '',
        };
    }

    @wire(getHotels, {})
    hotelsList;

    @wire(getHotelRecordTypeId, {})
    setHotelRecordTypeId({ error, data }) {
        if (data) {
            this.formFields.recordTypeId = data.slice(0, -3);
        }
    }

    changedHandler(event){
        const { value, name } = event.target;
        this.formFields = { 
            ...this.formFields, 
            [name]: value 
        };
    }
 
    // Insert record.
    createAccount(){
        var isValid = true;
        this.template.querySelectorAll('lightning-input').forEach(element => {
            isValid &= element.reportValidity();
        });
        if(!isValid){
            return;
        }
        
        const fields = {
            [RECORD_TYPE_ID_FIELD.fieldApiName]: this.formFields.recordTypeId,
            [NAME_FIELD.fieldApiName]: this.formFields.name,
            [STREET_FIELD.fieldApiName]: this.formFields.street,
            [CITY_FIELD.fieldApiName]: this.formFields.city,
            [STATE_FIELD.fieldApiName]: this.formFields.state,
            [POSTAL_CODE_FIELD.fieldApiName]: this.formFields.postalCode,
            [COUNTRY_FIELD.fieldApiName]: this.formFields.country,
            [PICTURE_FIELD.fieldApiName]: this.formFields.picture,
        };        
        let recordInput = { apiName: ACCOUNT_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then(result => {
                this.dispatchEvent(showToastedMessage('Success !', 'Hotel was added', 'success'));
                refreshApex(this.hotelsList);
                this.formFields = this.initFields();
            }).catch(error => {
                this.dispatchEvent(showToastedMessage('Error !', 'Failed to add hotel', 'error'));
                console.log("Error: ", error);
            }); 
    }
}