import { LightningElement, wire } from 'lwc';
import getHotels from '@salesforce/apex/AccountController.getHotels';


export default class HotelsMap extends LightningElement {
    zoomLevel = 14;

    @wire(getHotels, {})
    hotelsList;

    get hotelsMarkers() {
        var markers = [];
        if(this.hotelsList.data){
            this.hotelsList.data.forEach(hotel => {
                markers.push({
                    location: {
                        City: hotel.BillingCity,
                        Country: hotel.BillingCountry, 
                        PostalCode: hotel.BillingPostalCode,
                        State: hotel.BillingState,
                        Street: hotel.BillingStreet,    
                    },
                    icon: 'standard:account',
                    title: hotel.Name,
                    description: hotel.BillingStreet + ', ' + hotel.BillingCity + ', ' + hotel.BillingState + ' ' + hotel.BillingPostalCode
                }); 
            });
        }
        return markers;
    }
}