from typing import Dict, Any, Optional
import os
import tempfile
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
import weasyprint
from ..models import Proposal, ProposalTemplate, ProjectEstimate

class ProposalService:
    def __init__(self, templates_dir: str = 'templates'):
        self.templates_dir = templates_dir
        self.env = Environment(loader=FileSystemLoader(templates_dir))
        
        # Create templates directory if it doesn't exist
        os.makedirs(templates_dir, exist_ok=True)
        
        # Create default template if it doesn't exist
        self._create_default_template()
        
    def _create_default_template(self):
        """Create a default proposal template if none exists"""
        default_template_path = os.path.join(self.templates_dir, 'default_proposal.html')
        
        if not os.path.exists(default_template_path):
            default_template = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>{{ proposal.project_name }} - Proposal</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        color: #333;
                    }
                    .header {
                        background-color: #003366;
                        color: white;
                        padding: 20px;
                        text-align: center;
                    }
                    .content {
                        padding: 20px;
                    }
                    .section {
                        margin-bottom: 20px;
                        padding-bottom: 20px;
                        border-bottom: 1px solid #eee;
                    }
                    h1, h2, h3 {
                        color: #003366;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    th, td {
                        padding: 8px;
                        border: 1px solid #ddd;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    .footer {
                        background-color: #f2f2f2;
                        padding: 10px;
                        text-align: center;
                        font-size: 12px;
                        margin-top: 20px;
                    }
                    {{ custom_css }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>{{ proposal.project_name }}</h1>
                    <p>Proposal for {{ proposal.client_name }}</p>
                    <p>Date: {{ proposal.date.strftime('%B %d, %Y') }}</p>
                </div>
                
                <div class="content">
                    <div class="section">
                        <h2>Executive Summary</h2>
                        <p>{{ proposal.executive_summary }}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Scope of Work</h2>
                        <p>{{ proposal.scope_of_work }}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Technical Specifications</h2>
                        <p>{{ proposal.technical_specifications }}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Compliance Matrix</h2>
                        <table>
                            <tr>
                                <th>Code/Standard</th>
                                <th>Compliant</th>
                            </tr>
                            {% for code, compliant in proposal.compliance_matrix.items() %}
                            <tr>
                                <td>{{ code }}</td>
                                <td>{{ "Yes" if compliant else "No" }}</td>
                            </tr>
                            {% endfor %}
                        </table>
                    </div>
                    
                    <div class="section">
                        <h2>Cost Summary</h2>
                        <table>
                            <tr>
                                <th>Total Project Cost</th>
                                <td>${{ "{:,.2f}".format(proposal.total_cost) }}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="section">
                        <h2>Terms and Conditions</h2>
                        <p>{{ proposal.terms_and_conditions }}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Payment Schedule</h2>
                        <p>{{ proposal.payment_schedule }}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Timeline</h2>
                        <p>{{ proposal.timeline }}</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This proposal is valid until {{ proposal.valid_until.strftime('%B %d, %Y') }}</p>
                    <p>Generated by Estimator AI</p>
                </div>
            </body>
            </html>
            """
            
            with open(default_template_path, 'w') as f:
                f.write(default_template)
                
    def create_template(self, 
                       name: str, 
                       description: str, 
                       template_html: str,
                       css_style: Optional[str] = None) -> ProposalTemplate:
        """
        Create a new proposal template
        
        Args:
            name: Template name
            description: Template description
            template_html: HTML template content
            css_style: Optional CSS styles
            
        Returns:
            ProposalTemplate object
        """
        template_id = f"template_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Save the template file
        template_path = os.path.join(self.templates_dir, f"{template_id}.html")
        with open(template_path, 'w') as f:
            f.write(template_html)
            
        # Create the template object
        template = ProposalTemplate(
            template_id=template_id,
            name=name,
            description=description,
            template_html=template_html,
            css_style=css_style,
            variables={},
            created_at=datetime.now(),
            updated_at=datetime.now(),
            is_default=False
        )
        
        return template
        
    def generate_proposal_html(self, 
                              proposal: Proposal, 
                              template_id: Optional[str] = None,
                              custom_css: Optional[str] = None) -> str:
        """
        Generate HTML for a proposal using a template
        
        Args:
            proposal: Proposal object
            template_id: Optional template ID (uses default if not specified)
            custom_css: Optional custom CSS
            
        Returns:
            Generated HTML string
        """
        # Determine which template to use
        template_name = f"{template_id}.html" if template_id else "default_proposal.html"
        
        # Get the template
        template = self.env.get_template(template_name)
        
        # Render the template
        html = template.render(
            proposal=proposal,
            custom_css=custom_css if custom_css else ""
        )
        
        return html
        
    def generate_proposal_pdf(self,
                             proposal: Proposal,
                             output_path: Optional[str] = None,
                             template_id: Optional[str] = None,
                             custom_css: Optional[str] = None) -> str:
        """
        Generate a PDF proposal
        
        Args:
            proposal: Proposal object
            output_path: Optional output file path
            template_id: Optional template ID
            custom_css: Optional custom CSS
            
        Returns:
            Path to the generated PDF file
        """
        # Generate HTML
        html = self.generate_proposal_html(proposal, template_id, custom_css)
        
        # Create a temporary file if output_path is not specified
        if not output_path:
            temp_fd, output_path = tempfile.mkstemp(suffix='.pdf')
            os.close(temp_fd)
            
        # Generate PDF
        weasyprint.HTML(string=html).write_pdf(output_path)
        
        return output_path
        
    def generate_proposal_from_estimate(self,
                                       estimate: ProjectEstimate,
                                       output_path: Optional[str] = None,
                                       template_id: Optional[str] = None,
                                       custom_css: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate a proposal from a project estimate
        
        Args:
            estimate: ProjectEstimate object
            output_path: Optional output file path
            template_id: Optional template ID
            custom_css: Optional custom CSS
            
        Returns:
            Dictionary with proposal object and PDF path
        """
        from ..agent import EstimatorAgent
        
        # Create the estimator agent
        estimator = EstimatorAgent()
        
        # Generate the proposal
        proposal = estimator.generate_proposal(estimate)
        
        # Generate the PDF
        pdf_path = self.generate_proposal_pdf(
            proposal=proposal,
            output_path=output_path,
            template_id=template_id,
            custom_css=custom_css
        )
        
        return {
            "proposal": proposal,
            "pdf_path": pdf_path
        } 