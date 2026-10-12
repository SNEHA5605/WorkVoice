public class ComplaintRules {

    public String evaluateComplaint(
            Complaint complaint)
            throws InvalidComplaintException {

        ComplaintPriority priority =
                complaint.getPriority();

        ComplaintStatus status =
                complaint.getStatus();


        // --------------------------------
        // CRITICAL COMPLAINT
        // --------------------------------

        if (
            priority == ComplaintPriority.CRITICAL
        ) {

            return "Immediate attention required.";
        }


        // --------------------------------
        // HIGH PRIORITY + OVERDUE
        // --------------------------------

        if (
            priority == ComplaintPriority.HIGH
            &&
            status == ComplaintStatus.OVERDUE
        ) {

            return "Complaint should be escalated.";
        }


        // --------------------------------
        // HIGH PRIORITY COMPLAINT
        // --------------------------------

        if (
            priority == ComplaintPriority.HIGH
        ) {

            return "Owner should review this complaint quickly.";
        }


        // --------------------------------
        // RESOLVED COMPLAINT
        // --------------------------------

        if (
            status == ComplaintStatus.RESOLVED
        ) {

            return "Complaint has already been resolved.";
        }


        // --------------------------------
        // DEFAULT
        // --------------------------------

        return "Complaint can follow normal processing.";
    }
}