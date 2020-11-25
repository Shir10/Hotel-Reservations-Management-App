import { LightningElement, wire } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import { showToastedMessage } from 'c/utils';
import getHotels from '@salesforce/apex/AccountController.getHotels';
import getContacts from '@salesforce/apex/AccountController.getContacts';
import getRoomTypes from '@salesforce/apex/AccountController.getRoomTypes';
import getAvailableRooms from '@salesforce/apex/AccountController.getAvailableRooms';
import getNumOfReservations from '@salesforce/apex/AccountController.getNumOfReservations';
import ROOM_RESERVATION_OBJECT from '@salesforce/schema/Room_Reservation__c';
import CONTACT_FIELD from '@salesforce/schema/Room_Reservation__c.Contact__c';
import NUMBER_OF_ROOMS_FIELD from '@salesforce/schema/Room_Reservation__c.Number_Of_Rooms__c';
import RESERVATION_DATE_FIELD from '@salesforce/schema/Room_Reservation__c.Reservation_Date__c';
import ROOM_TYPE_FIELD from '@salesforce/schema/Room_Reservation__c.Room_Type__c';


export default class RoomReservation extends LightningElement {
    formFields = this.initFields();
    
    @wire(getContacts)
    contactsList;

    @wire(getHotels, {})
    hotelsList;

    roomTypeList = [];
    roomTypeOptions = [];
    message;

    initFields() {
        return {
            contactId: '',
            hotelId: '',
            roomTypeId: '',
            numberOfRooms: '',
            date: '',
        };
    }

    get today() {
        var d = new Date();
        return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
    }    

    get contactOptions() {
        var options = [];
        if(this.contactsList.data){
            this.contactsList.data.forEach(contact => {
                options.push({
                    label: contact.Name + ", " + contact.Email,
                    value: contact.Id
                });
            });
        }
        return options;
    }

    get hotelOptions() {
        var options = [];
        if(this.hotelsList.data){
            this.hotelsList.data.forEach(hotel => {
                options.push({
                    label: hotel.Name + ", " + hotel.BillingStreet + ", " + hotel.BillingCity + ", " + hotel.BillingState + " " + hotel.BillingPostalCode + ", " + hotel.BillingCountry, 
                    value: hotel.Id
                });
            });
        }
        return options;
    }

    getRoomTypeOptions() {
        var options = [];
        if(this.roomTypeList){
            this.roomTypeList.forEach(roomType => {
                options.push({
                    label: roomType.Name,
                    value: roomType.Id
                });
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

    handleChangeContact(event) {
        this.formFields.contactId = event.detail.value;
    }

    handleChangeHotel(event) {
        this.formFields.hotelId = event.detail.value;
        getRoomTypes({ hotelId: this.formFields.hotelId })
            .then(result => {
                this.roomTypeList = result;
                this.roomTypeOptions = this.getRoomTypeOptions();
            }).catch(error => {
                console.log("Error: ", error);
            });
    }

    handleChangeRoomType(event) {
        this.formFields.roomTypeId = event.detail.value;
    }

    // Insert record.
    createRoomReservation(){
        var isValid = true;
        this.template.querySelectorAll('lightning-input, lightning-combobox').forEach(element => {
            isValid &= element.reportValidity();
        });
        if(!isValid){
            return;
        }
        
        getAvailableRooms({ roomTypeId: this.formFields.roomTypeId, bookDate: new Date(this.formFields.date) })
            .then(result => {
                if(result < this.formFields.numberOfRooms){
                    if (result == 0){
                        this.message = 'There are not available rooms of this room type';
                    } else if (result == 1) {
                        this.message = 'There is only one available room of this room type';
                    } else {
                        this.message = 'There are only ' + result + ' available rooms of this room type';
                    }
                    this.dispatchEvent(showToastedMessage('Error !', this.message, 'error'));
                } else {
                    getNumOfReservations({ contactId: this.formFields.contactId, bookDate: new Date(this.formFields.date) })
                        .then(result => {
                            if (result > 0) {
                                this.message = 'This contant already has a reservasion on this date'
                                this.dispatchEvent(showToastedMessage('Error !', this.message, 'error'));
                            }
                            else {
                                const fields = {
                                    [CONTACT_FIELD.fieldApiName]: this.formFields.contactId,
                                    [NUMBER_OF_ROOMS_FIELD.fieldApiName]: this.formFields.numberOfRooms,
                                    [RESERVATION_DATE_FIELD.fieldApiName]: this.formFields.date,
                                    [ROOM_TYPE_FIELD.fieldApiName]: this.formFields.roomTypeId,      
                                };        
                                let recordInput = { apiName: ROOM_RESERVATION_OBJECT.objectApiName, fields };
                        
                                createRecord(recordInput).then(result => {
                                    this.message = 'Room reservation was added';
                                    this.dispatchEvent(showToastedMessage('Success !', this.message, 'success'));
                                    this.formFields = this.initFields();
                                }).catch(error => {
                                    this.message = 'Failed to add a room reservation';
                                    this.dispatchEvent(showToastedMessage('Error !', this.message, 'error'));
                                    console.log("Error: ", error);
                                }); 
                            }
                        }).catch(error => {
                            this.message = 'Failed to add a room reservation';
                            this.dispatchEvent(showToastedMessage('Error !', this.message, 'error'));
                            console.log("Error: ", error);
                        });                    
                }
            }).catch(error => {
                this.message = 'Failed to add a room reservation';
                this.dispatchEvent(showToastedMessage('Error !', this.message, 'error'));
                console.log("Error: ", error);
            });        
    }    
}