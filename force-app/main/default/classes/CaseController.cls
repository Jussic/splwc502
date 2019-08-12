global with sharing class CaseController {

    @AuraEnabled(cacheable=true)
    global static List<Case> getCases(Id accountId) {
    List<Case> theCases = [SELECT Id, Subject, Status, CreatedDate, ClosedDate, Type, OwnerId, Priority 
                            FROM Case 
                            Where AccountId = :accountId];
    return theCases;        
    }

    @AuraEnabled
    global static void saveCases(String cases) { 
    system.debug(cases); 
    List<Case> theCases = (List<Case>)JSON.deserialize(cases, List<Case>.class);     
    system.debug(theCases); 
    database.update(theCases); 
    }
}
