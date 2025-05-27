from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
from enum import Enum

class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    MODIFIED = "modified"

class ApprovalRequest:
    def __init__(
        self,
        request_id: str,
        project_id: str,
        proposal_id: str,
        created_at: datetime,
        status: ApprovalStatus = ApprovalStatus.PENDING,
        assignee: Optional[str] = None,
        comments: List[Dict[str, Any]] = None,
        pdf_url: Optional[str] = None,
        modified_content: Optional[Dict[str, Any]] = None
    ):
        self.request_id = request_id
        self.project_id = project_id
        self.proposal_id = proposal_id
        self.created_at = created_at
        self.status = status
        self.assignee = assignee
        self.comments = comments or []
        self.pdf_url = pdf_url
        self.modified_content = modified_content
        self.updated_at = created_at
        
    def to_dict(self) -> Dict[str, Any]:
        """Convert approval request to dictionary"""
        return {
            "request_id": self.request_id,
            "project_id": self.project_id,
            "proposal_id": self.proposal_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "status": self.status.value,
            "assignee": self.assignee,
            "comments": self.comments,
            "pdf_url": self.pdf_url,
            "modified_content": self.modified_content
        }
        
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ApprovalRequest':
        """Create approval request from dictionary"""
        return cls(
            request_id=data.get("request_id"),
            project_id=data.get("project_id"),
            proposal_id=data.get("proposal_id"),
            created_at=datetime.fromisoformat(data.get("created_at")),
            status=ApprovalStatus(data.get("status", "pending")),
            assignee=data.get("assignee"),
            comments=data.get("comments", []),
            pdf_url=data.get("pdf_url"),
            modified_content=data.get("modified_content")
        )

class ApprovalService:
    def __init__(self, aws_service=None, notification_service=None):
        """
        Initialize the approval service
        
        Args:
            aws_service: AWS service for DynamoDB and S3 operations
            notification_service: Service for sending notifications
        """
        self.aws_service = aws_service
        self.notification_service = notification_service
        self.approval_requests = {}  # In-memory store (replace with DynamoDB in production)
        
    def create_approval_request(
        self,
        project_id: str,
        proposal_id: str,
        pdf_url: str,
        assignee: Optional[str] = None
    ) -> ApprovalRequest:
        """
        Create a new approval request
        
        Args:
            project_id: ID of the project
            proposal_id: ID of the proposal
            pdf_url: URL to the proposal PDF
            assignee: Optional email of the assignee
            
        Returns:
            New ApprovalRequest object
        """
        request_id = f"req-{uuid.uuid4()}"
        request = ApprovalRequest(
            request_id=request_id,
            project_id=project_id,
            proposal_id=proposal_id,
            created_at=datetime.now(),
            status=ApprovalStatus.PENDING,
            assignee=assignee,
            pdf_url=pdf_url
        )
        
        # Store the request
        self.approval_requests[request_id] = request
        
        # Send notification if notification service is available
        if self.notification_service and assignee:
            self.notification_service.send_approval_notification(
                recipient=assignee,
                request_id=request_id,
                project_id=project_id,
                pdf_url=pdf_url
            )
            
        return request
        
    def get_approval_request(self, request_id: str) -> Optional[ApprovalRequest]:
        """
        Get an approval request by ID
        
        Args:
            request_id: ID of the approval request
            
        Returns:
            ApprovalRequest object if found, None otherwise
        """
        return self.approval_requests.get(request_id)
        
    def get_approval_requests_by_project(self, project_id: str) -> List[ApprovalRequest]:
        """
        Get all approval requests for a project
        
        Args:
            project_id: ID of the project
            
        Returns:
            List of ApprovalRequest objects
        """
        return [
            request for request in self.approval_requests.values()
            if request.project_id == project_id
        ]
        
    def get_approval_requests_by_assignee(self, assignee: str) -> List[ApprovalRequest]:
        """
        Get all approval requests assigned to a user
        
        Args:
            assignee: Email of the assignee
            
        Returns:
            List of ApprovalRequest objects
        """
        return [
            request for request in self.approval_requests.values()
            if request.assignee == assignee
        ]
        
    def approve_request(
        self,
        request_id: str,
        approver: str,
        comment: Optional[str] = None
    ) -> Optional[ApprovalRequest]:
        """
        Approve an approval request
        
        Args:
            request_id: ID of the approval request
            approver: Email of the approver
            comment: Optional comment
            
        Returns:
            Updated ApprovalRequest object if found, None otherwise
        """
        request = self.get_approval_request(request_id)
        if not request:
            return None
            
        request.status = ApprovalStatus.APPROVED
        request.updated_at = datetime.now()
        
        if comment:
            request.comments.append({
                "user": approver,
                "text": comment,
                "timestamp": datetime.now().isoformat()
            })
            
        # Send notification if notification service is available
        if self.notification_service:
            self.notification_service.send_approval_confirmation(
                request_id=request_id,
                project_id=request.project_id,
                status="approved",
                approver=approver
            )
            
        return request
        
    def reject_request(
        self,
        request_id: str,
        rejector: str,
        reason: str
    ) -> Optional[ApprovalRequest]:
        """
        Reject an approval request
        
        Args:
            request_id: ID of the approval request
            rejector: Email of the rejector
            reason: Reason for rejection
            
        Returns:
            Updated ApprovalRequest object if found, None otherwise
        """
        request = self.get_approval_request(request_id)
        if not request:
            return None
            
        request.status = ApprovalStatus.REJECTED
        request.updated_at = datetime.now()
        
        request.comments.append({
            "user": rejector,
            "text": reason,
            "timestamp": datetime.now().isoformat()
        })
            
        # Send notification if notification service is available
        if self.notification_service:
            self.notification_service.send_approval_confirmation(
                request_id=request_id,
                project_id=request.project_id,
                status="rejected",
                approver=rejector,
                comment=reason
            )
            
        return request
        
    def modify_request(
        self,
        request_id: str,
        modifier: str,
        modified_content: Dict[str, Any],
        comment: Optional[str] = None
    ) -> Optional[ApprovalRequest]:
        """
        Modify an approval request
        
        Args:
            request_id: ID of the approval request
            modifier: Email of the modifier
            modified_content: Modified content
            comment: Optional comment
            
        Returns:
            Updated ApprovalRequest object if found, None otherwise
        """
        request = self.get_approval_request(request_id)
        if not request:
            return None
            
        request.status = ApprovalStatus.MODIFIED
        request.updated_at = datetime.now()
        request.modified_content = modified_content
        
        if comment:
            request.comments.append({
                "user": modifier,
                "text": comment,
                "timestamp": datetime.now().isoformat()
            })
            
        # Send notification if notification service is available
        if self.notification_service:
            self.notification_service.send_approval_confirmation(
                request_id=request_id,
                project_id=request.project_id,
                status="modified",
                approver=modifier,
                comment=comment
            )
            
        return request 