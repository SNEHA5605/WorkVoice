public class BaseComplaintHandler {

    protected String handlerName;

    public BaseComplaintHandler(String handlerName) {
        this.handlerName = handlerName;
    }

    public void displayHandler() {
        System.out.println(
                "Handler: " + handlerName
        );
    }
}