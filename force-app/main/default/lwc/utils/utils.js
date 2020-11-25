import { ShowToastEvent } from 'lightning/platformShowToastEvent';


const HOTEL_RECORD_TYPE_ID = '0124K000000HanS';

const showToastedMessage = (title, message, variant) => {
    const toastEvent = new ShowToastEvent({
        title,
        message,
        variant,
    });
    return toastEvent;   
}


export { HOTEL_RECORD_TYPE_ID, showToastedMessage };
