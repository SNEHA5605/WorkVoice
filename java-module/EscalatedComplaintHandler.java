public class EscalatedComplaintHandler
        extends BaseComplaintHandler
        implements ComplaintHandler {

    public EscalatedComplaintHandler() {
        super("Escalation Support Team");
    }

    @Override
    public String handleComplaint(
            Complaint complaint) {

        return "Complaint has been escalated and requires immediate review.";
    }
}