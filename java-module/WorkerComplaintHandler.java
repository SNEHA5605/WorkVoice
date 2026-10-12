public class WorkerComplaintHandler
        extends BaseComplaintHandler
        implements ComplaintHandler {

    public WorkerComplaintHandler() {
        super("Worker Support Team");
    }

    @Override
    public String handleComplaint(
            Complaint complaint) {

        return "Worker complaint has been received and is being processed.";
    }
}