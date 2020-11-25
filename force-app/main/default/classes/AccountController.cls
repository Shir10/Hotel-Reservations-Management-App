
public with sharing class AccountController {
    static String HotelRecordTypeId = getHotelRecordTypeId();

    @AuraEnabled(cacheable=true)
    public static String getHotelRecordTypeId() {
        return [
            SELECT id 
            FROM RecordType 
            WHERE Name ='Hotel'
        ].Id;
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> getHotels() {
        return [
            SELECT Id, Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry
            FROM Account
            WHERE RecordTypeId = :HotelRecordTypeId
            WITH SECURITY_ENFORCED
            ORDER BY Name
        ];
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {
        return [
            SELECT Id, Name, Email
            FROM Contact
            WITH SECURITY_ENFORCED
            ORDER BY Name
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Room_Type__c> getRoomTypes(String hotelId) {
        return [
            SELECT Id, Name
            FROM Room_Type__c
            WHERE Hotel__c = :hotelId
            WITH SECURITY_ENFORCED
            ORDER BY Name
        ];
    }

    @AuraEnabled(cacheable=true)
    public static Integer getAvailableRooms(String roomTypeId, Date bookDate) {
        List<Room_Type__c> totalRooms = [
            SELECT Number_Of_Available_Rooms__c
            FROM Room_Type__c
            WHERE Id = :roomTypeId
            WITH SECURITY_ENFORCED
        ];

        Decimal bookedRooms = (Decimal) [
            SELECT SUM(Number_Of_Rooms__c) sumBookedRooms
            FROM Room_Reservation__c
            WHERE Room_Type__c = :roomTypeId 
            AND Reservation_Date__c = :bookDate
            WITH SECURITY_ENFORCED
        ][0].get('sumBookedRooms');

        if(bookedRooms == null){
            bookedRooms = 0;
        }
        return (Integer)(totalRooms[0].Number_Of_Available_Rooms__c) - (Integer)(bookedRooms);
    }

    @AuraEnabled(cacheable=true)
    public static Integer getNumOfReservations(String contactId, Date bookDate) {
        Decimal reservations = (Decimal) [
            SELECT COUNT(Id) countReservations
            FROM Room_Reservation__c
            WHERE Contact__c = :contactId 
            AND Reservation_Date__c = :bookDate
            WITH SECURITY_ENFORCED
        ][0].get('countReservations');

        return (Integer)(reservations);
    }

    @AuraEnabled(cacheable=true)
    public static List<Account> searchHotels(String hotelName) {
        return [
            SELECT Id, Name, BillingStreet, BillingCity, BillingState, BillingPostalCode, BillingCountry, Picture__c
            FROM Account
            WHERE RecordTypeId = :HotelRecordTypeId
            AND Name LIKE :'%' + hotelName + '%'
            WITH SECURITY_ENFORCED
            ORDER BY Name
        ];
    }
}