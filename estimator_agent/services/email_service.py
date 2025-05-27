import boto3
from botocore.exceptions import ClientError
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self, region_name: str, from_email: str):
        """Initialize the email service with AWS SES.
        
        Args:
            region_name: AWS region name
            from_email: Verified sender email address
        """
        self.ses = boto3.client('ses', region_name=region_name)
        self.from_email = from_email

    def send_proposal_email(
        self,
        to_email: str,
        client_name: str,
        project_name: str,
        proposal_url: str
    ) -> bool:
        """Send a proposal email to a client.
        
        Args:
            to_email: Recipient email address
            client_name: Name of the client
            project_name: Name of the project
            proposal_url: URL to download the proposal PDF
            
        Returns:
            bool: True if email was sent successfully
        """
        subject = f"Your Proposal for {project_name}"
        body = f"""
        Dear {client_name},

        Thank you for your interest in our services. Please find attached your proposal for {project_name}.

        You can download your proposal here: {proposal_url}

        If you have any questions or need any clarification, please don't hesitate to contact us.

        Best regards,
        Your Company Name
        """

        try:
            response = self.ses.send_email(
                Source=self.from_email,
                Destination={
                    'ToAddresses': [to_email]
                },
                Message={
                    'Subject': {
                        'Data': subject
                    },
                    'Body': {
                        'Text': {
                            'Data': body
                        }
                    }
                }
            )
            logger.info(f"Proposal email sent successfully. MessageId: {response['MessageId']}")
            return True
        except ClientError as e:
            logger.error(f"Failed to send proposal email: {str(e)}")
            return False

    def send_project_update(
        self,
        to_email: str,
        client_name: str,
        project_name: str,
        update_message: str
    ) -> bool:
        """Send a project update email to a client.
        
        Args:
            to_email: Recipient email address
            client_name: Name of the client
            project_name: Name of the project
            update_message: The update message to send
            
        Returns:
            bool: True if email was sent successfully
        """
        subject = f"Project Update: {project_name}"
        body = f"""
        Dear {client_name},

        This is an update regarding your project: {project_name}

        {update_message}

        If you have any questions, please don't hesitate to contact us.

        Best regards,
        Your Company Name
        """

        try:
            response = self.ses.send_email(
                Source=self.from_email,
                Destination={
                    'ToAddresses': [to_email]
                },
                Message={
                    'Subject': {
                        'Data': subject
                    },
                    'Body': {
                        'Text': {
                            'Data': body
                        }
                    }
                }
            )
            logger.info(f"Project update email sent successfully. MessageId: {response['MessageId']}")
            return True
        except ClientError as e:
            logger.error(f"Failed to send project update email: {str(e)}")
            return False

    def send_system_alert(
        self,
        to_emails: List[str],
        alert_type: str,
        message: str
    ) -> bool:
        """Send a system alert email to administrators.
        
        Args:
            to_emails: List of recipient email addresses
            alert_type: Type of alert (e.g., "ERROR", "WARNING")
            message: The alert message
            
        Returns:
            bool: True if email was sent successfully
        """
        subject = f"System Alert: {alert_type}"
        body = f"""
        System Alert Notification

        Type: {alert_type}
        Message: {message}

        Please check the system logs for more details.

        Best regards,
        System Administrator
        """

        try:
            response = self.ses.send_email(
                Source=self.from_email,
                Destination={
                    'ToAddresses': to_emails
                },
                Message={
                    'Subject': {
                        'Data': subject
                    },
                    'Body': {
                        'Text': {
                            'Data': body
                        }
                    }
                }
            )
            logger.info(f"System alert email sent successfully. MessageId: {response['MessageId']}")
            return True
        except ClientError as e:
            logger.error(f"Failed to send system alert email: {str(e)}")
            return False 