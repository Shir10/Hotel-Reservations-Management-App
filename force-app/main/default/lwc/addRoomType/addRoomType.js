import { LightningElement, wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { showToastedMessage } from 'c/utils';
import getHotels from '@salesforce/apex/AccountController.getHotels';
import ROOM_TYPE_OBJECT from '@salesforce/schema/Room_Type__c';
import NAME_FIELD from '@salesforce/schema/Room_Type__c.Name';
import AVAILABLE_ROOMS_FIELD from '@salesforce/schema/Room_Type__c.Number_Of_Available_Rooms__c';
import HOTEL_FIELD from '@salesforce/schema/Room_Type__c.Hotel__c';


export default class AddRoomType extends LightningElement {
    formFields = this.initFields();
    
    @wire(getHotels, {})
    hotelsList;

    initFields() {
        return {
            name: '',
            hotelID: '',
            availableRooms: '',
        };
    }

    get hotelOptions() {
        var options = [];
        if(this.hotelsList.data){
            this.hotelsList.data.forEach(hotel => {
                options.push({
                    label: hotel.Name + ", " + hotel.BillingStreet + ", " + hotel.BillingCity + ", " + hotel.BillingState + " " + hotel.BillingPostalCode + ", " + hotel.BillingCountry, 
                    value: hotel.Id});
            }); 
        }
        return options;
    }

    changedHandler(event){
        const { value, name } = event.target;
        this.formFields = { 
            ...this.formFields, 
            [name]: value 
        };
    }

    handleChangeHotel(event) {
        this.formFields.hotelID = event.detail.value;
    }

    // Insert record.
    createRoomType(){
        var isValid = true;
        this.template.querySelectorAll('lightning-input, lightning-combobox').forEach(element => {
            isValid &= element.reportValidity();
        });
        if(!isValid){
            return;
        }

        const fields = {
            [NAME_FIELD.fieldApiName]: this.formFields.name,
            [AVAILABLE_ROOMS_FIELD.fieldApiName]: this.formFields.availableRooms,
            [HOTEL_FIELD.fieldApiName]: this.formFields.hotelID,            
        };        
        let recordInput = { apiName: ROOM_TYPE_OBJECT.objectApiName, fields };

        createRecord(recordInput).then(result => {
            this.dispatchEvent(showToastedMessage('Success !', 'Room Type was added', 'success'));
            this.formFields = this.initFields();   
        }).catch(error => {
            this.dispatchEvent(showToastedMessage('Error !', 'Failed to add room type', 'error'));
            console.log("Error: ", error);
        }); 
    }
}