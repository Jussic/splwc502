global with sharing class OpportunityController 
{
    @AuraEnabled(cacheable=true)
    global static List<Opportunity> getOpportunities(Id accountId) {
    List<Opportunity> theOpps = [SELECT Id, Name, AccountId FROM Opportunity Where AccountId = :accountId];
    return theOpps;        
    }

    @AuraEnabled(cacheable=true)
    global static void saveOpportunities(String opportunities) { 
    system.debug(opportunities); 
    List<Opportunity> opps = (List<Opportunity>)JSON.deserialize(opportunities, List<Opportunity>.class); 
    system.debug(opps); database.update(opps); 
    }

}