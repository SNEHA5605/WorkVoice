public class Complaint {

    private int complaintId;
    private String category;
    private String description;

    private ComplaintPriority priority;
    private ComplaintStatus status;


    // --------------------------------
    // CONSTRUCTOR
    // --------------------------------

    public Complaint(
            int complaintId,
            String category,
            String description,
            ComplaintPriority priority,
            ComplaintStatus status) {

        this.complaintId = complaintId;
        this.category = category;
        this.description = description;
        this.priority = priority;
        this.status = status;
    }


    // --------------------------------
    // GETTERS
    // --------------------------------

    public int getComplaintId() {
        return complaintId;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public ComplaintPriority getPriority() {
        return priority;
    }

    public ComplaintStatus getStatus() {
        return status;
    }


    // --------------------------------
    // SETTERS
    // --------------------------------

    public void setPriority(
            ComplaintPriority priority) {

        this.priority = priority;
    }

    public void setStatus(
            ComplaintStatus status) {

        this.status = status;
    }


    // --------------------------------
    // DISPLAY COMPLAINT
    // --------------------------------

    public void displayComplaint() {

        System.out.println(
                "Complaint ID: " + complaintId
        );

        System.out.println(
                "Category: " + category
        );

        System.out.println(
                "Description: " + description
        );

        System.out.println(
                "Priority: " + priority
        );

        System.out.println(
                "Status: " + status
        );
    }
}