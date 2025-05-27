from typing import Dict, Any, List, Optional
from ..config import SES_CONFIG
from .email_service import EmailService

class NotificationService:
    def __init__(self, email_service: EmailService = None, slack_token: Optional[str] = None):
        """
        Initialize the notification service
        
        Args:
            email_service: EmailService for sending email notifications
            slack_token: Optional Slack token for sending Slack notifications
        """
        self.email_service = email_service
        self.slack_token = slack_token
        self.default_sender = SES_CONFIG.get('email_sender', 'noreply@yourdomain.com')
        
    def send_approval_notification(
        self,
        recipient: str,
        request_id: str,
        project_id: str,
        pdf_url: str,
        additional_context: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Send an approval notification
        
        Args:
            recipient: Email of the recipient
            request_id: ID of the approval request
            project_id: ID of the project
            pdf_url: URL to the proposal PDF
            additional_context: Optional additional context
            
        Returns:
            True if notification was sent successfully, False otherwise
        """
        # Prepare the email subject and content
        subject = f"Approval Request: Project {project_id}"
        
        # Create the email body
        body_text = f"""
        Hello,
        
        A new proposal requires your approval for project {project_id}.
        
        Request ID: {request_id}
        Proposal URL: {pdf_url}
        
        Please review the proposal and take one of the following actions:
        1. Approve the proposal
        2. Reject the proposal with a reason
        3. Modify the proposal and resubmit
        
        You can access the approval dashboard at: https://yourdomain.com/approvals/{request_id}
        
        Thank you,
        Estimator AI Team
        """
        
        # Create the HTML version of the email
        body_html = f"""
        <html>
        <head></head>
        <body>
            <h2>Proposal Approval Request</h2>
            <p>A new proposal requires your approval for project <strong>{project_id}</strong>.</p>
            <p><strong>Request ID:</strong> {request_id}</p>
            <p><strong>Proposal:</strong> <a href="{pdf_url}">View Proposal</a></p>
            
            <p>Please review the proposal and take one of the following actions:</p>
            <ol>
                <li>Approve the proposal</li>
                <li>Reject the proposal with a reason</li>
                <li>Modify the proposal and resubmit</li>
            </ol>
            
            <p>You can access the approval dashboard at: <a href="https://yourdomain.com/approvals/{request_id}">Approval Dashboard</a></p>
            
            <p>Thank you,<br/>
            Estimator AI Team</p>
        </body>
        </html>
        """
        
        # Send the email
        if self.email_service:
            return self.email_service.send_email(
                sender=self.default_sender,
                recipients=[recipient],
                subject=subject,
                body_text=body_text,
                body_html=body_html
            )
            
        # Email service not available
        print(f"Email service not available, notification not sent to {recipient}")
        return False
        
    def send_approval_confirmation(
        self,
        request_id: str,
        project_id: str,
        status: str,
        approver: str,
        comment: Optional[str] = None
    ) -> bool:
        """
        Send an approval confirmation notification
        
        Args:
            request_id: ID of the approval request
            project_id: ID of the project
            status: Status of the approval (approved, rejected, modified)
            approver: Email of the approver
            comment: Optional comment
            
        Returns:
            True if notification was sent successfully, False otherwise
        """
        # Determine recipients from config (project managers, etc.)
        recipients = SES_CONFIG.get('notification_recipients', [])
        if not recipients:
            print("No notification recipients configured")
            return False
            
        # Prepare the email subject and content
        subject = f"Proposal {status.capitalize()}: Project {project_id}"
        
        # Create the email body
        body_text = f"""
        Hello,
        
        The proposal for project {project_id} has been {status} by {approver}.
        
        Request ID: {request_id}
        Status: {status.capitalize()}
        """
        
        if comment:
            body_text += f"\nComment: {comment}\n"
            
        body_text += """
        You can view the details in the approval dashboard.
        
        Thank you,
        Estimator AI Team
        """
        
        # Create the HTML version of the email
        body_html = f"""
        <html>
        <head></head>
        <body>
            <h2>Proposal {status.capitalize()}</h2>
            <p>The proposal for project <strong>{project_id}</strong> has been <strong>{status}</strong> by {approver}.</p>
            <p><strong>Request ID:</strong> {request_id}</p>
            <p><strong>Status:</strong> {status.capitalize()}</p>
        """
        
        if comment:
            body_html += f"<p><strong>Comment:</strong> {comment}</p>"
            
        body_html += """
            <p>You can view the details in the approval dashboard.</p>
            
            <p>Thank you,<br/>
            Estimator AI Team</p>
        </body>
        </html>
        """
        
        # Send the email
        if self.email_service:
            return self.email_service.send_email(
                sender=self.default_sender,
                recipients=recipients,
                subject=subject,
                body_text=body_text,
                body_html=body_html
            )
            
        # Email service not available
        print(f"Email service not available, notification not sent to {recipients}")
        return False
        
    def send_customer_notification(
        self,
        recipient: str,
        project_id: str,
        subject: str,
        message: str,
        pdf_url: Optional[str] = None,
        proposal_id: Optional[str] = None
    ) -> bool:
        """
        Send a notification to a customer
        
        Args:
            recipient: Email of the recipient
            project_id: ID of the project
            subject: Email subject
            message: Email message
            pdf_url: Optional URL to the proposal PDF
            proposal_id: Optional ID of the proposal
            
        Returns:
            True if notification was sent successfully, False otherwise
        """
        # Create the email body
        body_text = f"""
        Hello,
        
        {message}
        
        """
        
        if pdf_url:
            body_text += f"You can view the proposal at: {pdf_url}\n"
            
        body_text += """
        Thank you for your business!
        
        Best regards,
        Your Company
        """
        
        # Create the HTML version of the email
        body_html = f"""
        <html>
        <head></head>
        <body>
            <p>Hello,</p>
            
            <p>{message}</p>
        """
        
        if pdf_url:
            body_html += f"""
            <p>You can <a href="{pdf_url}">view the proposal here</a>.</p>
            """
            
        body_html += """
            <p>Thank you for your business!</p>
            
            <p>Best regards,<br/>
            Your Company</p>
        </body>
        </html>
        """
        
        # Send the email
        if self.email_service:
            return self.email_service.send_email(
                sender=self.default_sender,
                recipients=[recipient],
                subject=subject,
                body_text=body_text,
                body_html=body_html
            )
            
        # Email service not available
        print(f"Email service not available, notification not sent to {recipient}")
        return False
        
    def send_slack_notification(
        self,
        channel: str,
        message: str,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> bool:
        """
        Send a notification to a Slack channel
        
        Args:
            channel: Slack channel
            message: Message to send
            attachments: Optional attachments
            
        Returns:
            True if notification was sent successfully, False otherwise
        """
        # Check if Slack token is available
        if not self.slack_token:
            print("Slack token not available")
            return False
            
        try:
            # This is a simplified implementation
            # In a real implementation, you would use the Slack SDK
            print(f"Sending Slack notification to {channel}: {message}")
            return True
        except Exception as e:
            print(f"Error sending Slack notification: {str(e)}")
            return False 