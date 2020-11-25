import { LightningElement, track } from 'lwc';
import searchHotels from '@salesforce/apex/AccountController.searchHotels';
import './searchHotel'; 


export default class SearchHotel extends LightningElement {
    formFields = this.initFields();
    
    initFields() {
        return {
            hotelName: '',
        };
    }

    @track searchResultHotels;

    changedHandler(event){
        const { value, name } = event.target;
        this.formFields = { 
            ...this.formFields,
            [name]: value 
        };
    }

    search() {
        searchHotels({ hotelName: this.formFields.hotelName })
            .then(result => {
                this.searchResultHotels = result;
            }).catch(error => {
                console.log("Error: ", error);
            });
    }
}