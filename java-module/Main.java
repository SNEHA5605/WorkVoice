public class Main {

    public static void main(String[] args) {

        Complaint complaint = new Complaint(
                1,
                "Safety",
                "Safety equipment is not available.",
                ComplaintPriority.HIGH,
                ComplaintStatus.OVERDUE
        );


        ComplaintRules rules =
                new ComplaintRules();


        complaint.displayComplaint();

        System.out.println();


        try {

            String action =
                    rules.evaluateComplaint(
                            complaint
                    );

            System.out.println(
                    "Recommended Action: "
                    + action
            );

        } catch (
                InvalidComplaintException e) {

            System.out.println(
                    "Complaint Error: "
                    + e.getMessage()
            );
        }


        System.out.println();


        // Polymorphism

        ComplaintHandler handler;


        if (
            complaint.getStatus()
                    == ComplaintStatus.OVERDUE
        ) {

            handler =
                    new EscalatedComplaintHandler();

        } else {

            handler =
                    new WorkerComplaintHandler();
        }


        System.out.println(
                handler.handleComplaint(
                        complaint
                )
        );
    }
}