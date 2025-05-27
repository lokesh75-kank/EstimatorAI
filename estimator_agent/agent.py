from typing import List, Dict, Optional
from datetime import datetime, timedelta
from .models import (
    ProjectEstimate,
    SystemSpecification,
    CostBreakdown,
    Material,
    Labor,
    Equipment,
    Subcontractor,
    ProjectLocation,
    SystemType,
    Proposal
)
import json
from .services import AWSService, OpenAIService
from .config import AWSConfig, OpenAIConfig

class EstimatorAgent:
    def __init__(self, aws_config: Optional[AWSConfig] = None, openai_config: Optional[OpenAIConfig] = None):
        self.regional_codes = {
            "US": {
                "NFPA": ["72", "101", "13", "14", "20", "25"],
                "IFC": ["2021"],
                "UL": ["864", "268", "521"]
            },
            "CA": {
                "ULC": ["S524", "S536", "S537"],
                "CSA": ["C22.1", "C22.2"]
            }
        }
        
        self.labor_rates = {
            "US": {
                "journeyman": 45.0,
                "master": 65.0,
                "apprentice": 25.0
            },
            "CA": {
                "journeyman": 50.0,
                "master": 70.0,
                "apprentice": 30.0
            }
        }

        self.aws_service = AWSService(aws_config) if aws_config else None
        self.openai_service = OpenAIService(openai_config) if openai_config else None

    def analyze_project_scope(self, drawings: Dict, specifications: Dict) -> List[SystemSpecification]:
        """
        Analyze project drawings and specifications to determine required systems using AI.
        """
        systems = []
        detected = set()
        
        # Combine all text data for analysis
        text_data = {
            "drawings": json.dumps(drawings),
            "specifications": json.dumps(specifications)
        }
        
        # Use OpenAI for system detection if available
        if self.openai_service:
            try:
                prompt = f"""Analyze the following project information and identify required fire protection and security systems.
                Drawings: {text_data['drawings']}
                Specifications: {text_data['specifications']}
                
                Identify which of these systems are required:
                - Fire Alarm Systems
                - Fire Suppression Systems
                - Access Control Systems
                - CCTV Systems
                - Intrusion Detection Systems
                
                Return a JSON array of required systems."""
                
                response = self.openai_service.generate_completion(prompt)
                detected_systems = json.loads(response)
                
                for system in detected_systems:
                    if system.lower() == "fire alarm":
                        detected.add(SystemType.FIRE_ALARM)
                    elif system.lower() == "fire suppression":
                        detected.add(SystemType.FIRE_SUPPRESSION)
                    elif system.lower() == "access control":
                        detected.add(SystemType.ACCESS_CONTROL)
                    elif system.lower() == "cctv":
                        detected.add(SystemType.CCTV)
                    elif system.lower() == "intrusion detection":
                        detected.add(SystemType.INTRUSION_DETECTION)
            
            except Exception as e:
                print(f"Error using OpenAI for system detection: {e}")
                # Fallback to basic detection
                self._basic_system_detection(text_data, detected)
        else:
            # Use basic detection if AI service is not available
            self._basic_system_detection(text_data, detected)
        
        # If nothing detected, default to fire alarm
        if not detected:
            detected.add(SystemType.FIRE_ALARM)
            
        # Create system specifications
        for sys_type in detected:
            systems.append(SystemSpecification(
                system_type=sys_type,
                manufacturer="Generic",
                model="Standard",
                features=["Standard features"],
                certifications=["UL", "FM"],
                warranty_years=1
            ))
            
        return systems

    def _basic_system_detection(self, text_data: Dict, detected: set):
        """
        Basic system detection using keyword matching.
        """
        text = text_data['drawings'] + text_data['specifications']
        if any(k in text.lower() for k in ["fire alarm", "smoke detector", "pull station"]):
            detected.add(SystemType.FIRE_ALARM)
        if any(k in text.lower() for k in ["sprinkler", "suppression", "wet pipe", "dry pipe"]):
            detected.add(SystemType.FIRE_SUPPRESSION)
        if any(k in text.lower() for k in ["access control", "badge reader", "card reader"]):
            detected.add(SystemType.ACCESS_CONTROL)
        if any(k in text.lower() for k in ["cctv", "camera", "video surveillance"]):
            detected.add(SystemType.CCTV)
        if any(k in text.lower() for k in ["intrusion", "motion sensor", "security alarm"]):
            detected.add(SystemType.INTRUSION_DETECTION)

    def calculate_material_costs(self, system: SystemSpecification, location: ProjectLocation) -> List[Material]:
        """
        Calculate material costs based on system specifications and location.
        """
        # Mock material lists and costs
        base_costs = {
            SystemType.FIRE_ALARM: [
                ("FA-CTRL", "Fire Alarm Control Panel", "ea", 1, 1200.0),
                ("FA-DET", "Smoke Detector", "ea", 10, 45.0),
                ("FA-PULL", "Manual Pull Station", "ea", 4, 30.0),
            ],
            SystemType.FIRE_SUPPRESSION: [
                ("FS-VALVE", "Sprinkler Valve", "ea", 2, 350.0),
                ("FS-HEAD", "Sprinkler Head", "ea", 20, 18.0),
                ("FS-PIPE", "Pipe (ft)", "ft", 200, 3.5),
            ],
            SystemType.ACCESS_CONTROL: [
                ("AC-PNL", "Access Control Panel", "ea", 1, 900.0),
                ("AC-RDR", "Card Reader", "ea", 4, 120.0),
                ("AC-STRK", "Electric Strike", "ea", 4, 80.0),
            ],
            SystemType.CCTV: [
                ("CCTV-CAM", "CCTV Camera", "ea", 6, 150.0),
                ("CCTV-NVR", "Network Video Recorder", "ea", 1, 600.0),
                ("CCTV-CBL", "Cabling (ft)", "ft", 400, 0.5),
            ],
            SystemType.INTRUSION_DETECTION: [
                ("ID-PNL", "Intrusion Panel", "ea", 1, 700.0),
                ("ID-MOT", "Motion Sensor", "ea", 6, 60.0),
                ("ID-SIREN", "Siren", "ea", 2, 90.0),
            ],
        }
        supplier = "Generic Supplier"
        lead_time = 7
        items = base_costs.get(system.system_type, [])
        materials = []
        for sku, desc, unit, qty, unit_cost in items:
            total_cost = qty * unit_cost
            materials.append(Material(
                sku=sku,
                description=desc,
                unit=unit,
                quantity=qty,
                unit_cost=unit_cost,
                total_cost=total_cost,
                supplier=supplier,
                lead_time_days=lead_time
            ))
        return materials

    def calculate_labor_costs(self, system: SystemSpecification, location: ProjectLocation) -> List[Labor]:
        """
        Calculate labor costs based on system complexity and local rates.
        """
        # Mock labor hours by system type
        base_hours = {
            SystemType.FIRE_ALARM: 24,
            SystemType.FIRE_SUPPRESSION: 32,
            SystemType.ACCESS_CONTROL: 20,
            SystemType.CCTV: 18,
            SystemType.INTRUSION_DETECTION: 16,
        }
        country = location.country if location.country in self.labor_rates else "US"
        rate = self.labor_rates[country]["journeyman"]
        hours = base_hours.get(system.system_type, 16)
        total_cost = hours * rate
        return [Labor(
            category="journeyman",
            hours=hours,
            rate_per_hour=rate,
            total_cost=total_cost,
            skill_level="Journeyman"
        )]

    def calculate_equipment_costs(self, system: SystemSpecification) -> List[Equipment]:
        """
        Calculate equipment rental costs for installation.
        """
        # Mock equipment needs
        base_equipment = {
            SystemType.FIRE_ALARM: [("Lift", 120.0, 2)],
            SystemType.FIRE_SUPPRESSION: [("Pipe Threader", 80.0, 3)],
            SystemType.ACCESS_CONTROL: [("Drill", 30.0, 2)],
            SystemType.CCTV: [("Lift", 120.0, 1)],
            SystemType.INTRUSION_DETECTION: [("Ladder", 20.0, 2)],
        }
        items = base_equipment.get(system.system_type, [])
        equipment = []
        for name, daily_rate, days_needed in items:
            total_cost = daily_rate * days_needed
            equipment.append(Equipment(
                name=name,
                daily_rate=daily_rate,
                days_needed=days_needed,
                total_cost=total_cost
            ))
        return equipment

    def identify_subcontractors(self, system: SystemSpecification, location: ProjectLocation) -> List[Subcontractor]:
        """
        Identify required subcontractors and their costs.
        """
        # Mock: Only fire suppression needs a subcontractor
        if system.system_type == SystemType.FIRE_SUPPRESSION:
            return [Subcontractor(
                company="FireSprink Inc.",
                scope="Install and test fire suppression system",
                cost=2500.0,
                payment_terms="Net 30"
            )]
        return []

    def check_compliance(self, system: SystemSpecification, location: ProjectLocation) -> List[str]:
        """
        Check system compliance with local codes and standards.
        """
        compliance_codes = []
        country = location.country
        if country in self.regional_codes:
            for standard, codes in self.regional_codes[country].items():
                compliance_codes.extend(codes)
        return compliance_codes

    def identify_risk_factors(self, system: SystemSpecification, location: ProjectLocation) -> List[str]:
        """
        Identify potential risk factors for the project.
        """
        risks = []
        if location.seismic_zone:
            risks.append(f"Seismic considerations for zone {location.seismic_zone}")
        if location.climate_zone:
            risks.append(f"Climate considerations for zone {location.climate_zone}")
        return risks

    def suggest_value_engineering(self, system: SystemSpecification, cost_breakdown: CostBreakdown) -> List[str]:
        """
        Suggest value engineering opportunities based on system type and cost breakdown.
        """
        suggestions = []
        
        # Analyze material costs
        material_cost = sum(m.total_cost for m in cost_breakdown.materials)
        labor_cost = sum(l.total_cost for l in cost_breakdown.labor)
        equipment_cost = sum(e.total_cost for e in cost_breakdown.equipment)
        
        # System-specific value engineering suggestions
        if system.system_type == SystemType.FIRE_ALARM:
            if material_cost > 50000:
                suggestions.append("Consider using addressable devices to reduce wiring costs and improve system flexibility")
            if labor_cost > 30000:
                suggestions.append("Evaluate wireless device options to reduce installation time and labor costs")
            suggestions.append("Review detector spacing to optimize coverage while minimizing device count")
            
        elif system.system_type == SystemType.FIRE_SUPPRESSION:
            if material_cost > 75000:
                suggestions.append("Consider using CPVC piping for non-critical areas to reduce material costs")
                suggestions.append("Evaluate pre-action systems for areas with high water damage risk")
            if labor_cost > 40000:
                suggestions.append("Consider modular sprinkler systems for faster installation")
            suggestions.append("Review pipe routing to minimize material usage and installation time")
            
        elif system.system_type == SystemType.ACCESS_CONTROL:
            if material_cost > 25000:
                suggestions.append("Consider using mobile credentials to reduce card costs")
                suggestions.append("Evaluate IP-based readers for reduced wiring costs")
            if labor_cost > 20000:
                suggestions.append("Consider wireless locks for retrofit applications")
            suggestions.append("Review door hardware to ensure optimal security-to-cost ratio")
            
        elif system.system_type == SystemType.CCTV:
            if material_cost > 30000:
                suggestions.append("Consider using IP cameras with PoE to reduce cabling costs")
                suggestions.append("Evaluate cloud storage options to reduce local storage requirements")
            if labor_cost > 25000:
                suggestions.append("Consider wireless cameras for difficult-to-wire locations")
            suggestions.append("Review camera resolution requirements to optimize storage and bandwidth")
            
        elif system.system_type == SystemType.INTRUSION_DETECTION:
            if material_cost > 20000:
                suggestions.append("Consider using wireless sensors to reduce installation costs")
                suggestions.append("Evaluate dual-technology sensors to reduce false alarms")
            if labor_cost > 15000:
                suggestions.append("Consider self-contained devices for faster installation")
            suggestions.append("Review sensor coverage to optimize detection while minimizing device count")
        
        # General value engineering suggestions
        if material_cost > 100000:
            suggestions.append("Consider bulk purchasing for major components to reduce unit costs")
            suggestions.append("Evaluate alternative suppliers for competitive pricing")
        
        if labor_cost > 50000:
            suggestions.append("Consider phased installation to optimize labor utilization")
            suggestions.append("Evaluate prefabrication opportunities to reduce on-site labor")
        
        if equipment_cost > 10000:
            suggestions.append("Consider equipment rental vs. purchase based on project duration")
            suggestions.append("Evaluate shared equipment usage across multiple systems")
        
        # Add AI-powered suggestions if available
        if self.openai_service:
            try:
                prompt = f"""Analyze the following system and cost data to suggest value engineering opportunities:
                System Type: {system.system_type.value}
                Material Cost: ${material_cost:,.2f}
                Labor Cost: ${labor_cost:,.2f}
                Equipment Cost: ${equipment_cost:,.2f}
                
                Provide specific, actionable value engineering suggestions that could reduce costs while maintaining quality and compliance."""
                
                ai_suggestions = self.openai_service.generate_completion(prompt)
                if ai_suggestions:
                    suggestions.extend(ai_suggestions.split('\n'))
            except Exception as e:
                print(f"Error generating AI value engineering suggestions: {e}")
        
        return suggestions

    def generate_estimate(self, 
                         project_id: str,
                         client_name: str,
                         project_name: str,
                         location: ProjectLocation,
                         drawings: Dict,
                         specifications: Dict) -> ProjectEstimate:
        """
        Generate a complete project estimate.
        """
        systems = self.analyze_project_scope(drawings, specifications)
        
        all_materials = []
        all_labor = []
        all_equipment = []
        all_subcontractors = []
        all_compliance_codes = []
        all_risk_factors = []
        all_value_engineering = []

        for system in systems:
            all_materials.extend(self.calculate_material_costs(system, location))
            all_labor.extend(self.calculate_labor_costs(system, location))
            all_equipment.extend(self.calculate_equipment_costs(system))
            all_subcontractors.extend(self.identify_subcontractors(system, location))
            all_compliance_codes.extend(self.check_compliance(system, location))
            all_risk_factors.extend(self.identify_risk_factors(system, location))

        total_cost = sum(m.total_cost for m in all_materials) + \
                    sum(l.total_cost for l in all_labor) + \
                    sum(e.total_cost for e in all_equipment) + \
                    sum(s.cost for s in all_subcontractors)

        contingency_amount = total_cost * 0.10
        tax_rate = 0.08  # Example tax rate, should be location-specific
        tax_amount = total_cost * tax_rate
        grand_total = total_cost + contingency_amount + tax_amount

        cost_breakdown = CostBreakdown(
            materials=all_materials,
            labor=all_labor,
            equipment=all_equipment,
            subcontractors=all_subcontractors,
            total_cost=total_cost,
            contingency_amount=contingency_amount,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            grand_total=grand_total
        )

        for system in systems:
            all_value_engineering.extend(self.suggest_value_engineering(system, cost_breakdown))

        return ProjectEstimate(
            project_id=project_id,
            client_name=client_name,
            project_name=project_name,
            location=location,
            systems=systems,
            cost_breakdown=cost_breakdown,
            valid_until=datetime.now() + timedelta(days=30),
            compliance_codes=all_compliance_codes,
            risk_factors=all_risk_factors,
            value_engineering_suggestions=all_value_engineering
        )

    def generate_proposal(self, estimate: ProjectEstimate) -> Proposal:
        """
        Generate a comprehensive proposal based on the project estimate.
        """
        try:
            # Generate all proposal sections
            executive_summary = self._generate_executive_summary(estimate)
            scope_of_work = self._generate_scope_of_work(estimate)
            technical_specs = self._generate_technical_specifications(estimate)
            compliance_matrix = self._generate_compliance_matrix(estimate)
            terms = self._generate_terms_and_conditions()
            payment_schedule = self._generate_payment_schedule()
            timeline = self._generate_timeline()

            # Create the proposal
            proposal = Proposal(
                project_id=estimate.project_id,
                client_name=estimate.client_name,
                project_name=estimate.project_name,
                date=datetime.now(),
                executive_summary=executive_summary,
                scope_of_work=scope_of_work,
                technical_specifications=technical_specs,
                compliance_matrix=compliance_matrix,
                terms_and_conditions=terms,
                payment_schedule=payment_schedule,
                timeline=timeline,
                total_cost=estimate.total_cost,
                valid_until=datetime.now() + timedelta(days=30)
            )

            return proposal

        except Exception as e:
            print(f"Error generating proposal: {e}")
            raise

    def _generate_executive_summary(self, estimate: ProjectEstimate) -> str:
        """
        Generate an executive summary for the proposal.
        """
        if self.openai_service:
            try:
                prompt = f"""Generate a professional executive summary for a fire protection and security systems project.
                Project Details:
                - Client: {estimate.client_name}
                - Project: {estimate.project_name}
                - Total Cost: ${estimate.total_cost:,.2f}
                - Systems: {[system.system_type.value for system in estimate.systems]}
                
                The summary should highlight the key benefits and value proposition of the proposed solution."""
                
                return self.openai_service.generate_completion(prompt)
            except Exception as e:
                print(f"Error generating executive summary with AI: {e}")
        
        # Fallback to template-based summary
        return f"""Executive Summary

We are pleased to present this proposal for the {estimate.project_name} project. Our comprehensive solution includes {len(estimate.systems)} integrated systems designed to meet your specific requirements while ensuring compliance with all applicable codes and standards.

The proposed solution represents an investment of ${estimate.total_cost:,.2f} and includes all necessary equipment, installation, testing, and commissioning services. Our team of certified professionals will ensure a smooth implementation process and provide ongoing support throughout the project lifecycle."""

    def _generate_scope_of_work(self, estimate: ProjectEstimate) -> str:
        """
        Generate a detailed scope of work section.
        """
        scope = ["Scope of Work\n"]
        
        for system in estimate.systems:
            scope.append(f"\n{system.system_type.value} System:")
            scope.append("- Installation of all equipment and devices")
            scope.append("- System programming and configuration")
            scope.append("- Testing and commissioning")
            scope.append("- Training for system operators")
            scope.append("- Documentation and as-built drawings")
            
            if system.system_type == SystemType.FIRE_ALARM:
                scope.append("- Integration with building management system")
                scope.append("- Emergency communication system setup")
            elif system.system_type == SystemType.FIRE_SUPPRESSION:
                scope.append("- Hydraulic calculations")
                scope.append("- Flow testing and certification")
            elif system.system_type == SystemType.ACCESS_CONTROL:
                scope.append("- Card programming and setup")
                scope.append("- Access level configuration")
            elif system.system_type == SystemType.CCTV:
                scope.append("- Camera positioning and setup")
                scope.append("- Recording system configuration")
            elif system.system_type == SystemType.INTRUSION_DETECTION:
                scope.append("- Sensor programming")
                scope.append("- Alarm verification setup")
        
        return "\n".join(scope)

    def _generate_technical_specifications(self, estimate: ProjectEstimate) -> str:
        """
        Generate technical specifications for all systems.
        """
        specs = ["Technical Specifications\n"]
        
        for system in estimate.systems:
            specs.append(f"\n{system.system_type.value} System Specifications:")
            specs.append(f"Manufacturer: {system.manufacturer}")
            specs.append(f"Model: {system.model}")
            specs.append("Features:")
            for feature in system.features:
                specs.append(f"- {feature}")
            specs.append("Certifications:")
            for cert in system.certifications:
                specs.append(f"- {cert}")
            specs.append(f"Warranty: {system.warranty_years} years")
        
        return "\n".join(specs)

    def _generate_compliance_matrix(self, estimate: ProjectEstimate) -> Dict[str, bool]:
        """
        Generate a compliance matrix for all applicable codes and standards.
        """
        compliance = {}
        
        for system in estimate.systems:
            codes = self.check_compliance(system, estimate.location)
            for code in codes:
                compliance[code] = True
        
        return compliance

    def _generate_terms_and_conditions(self) -> str:
        """
        Generate standard terms and conditions.
        """
        return """Terms and Conditions

1. Payment Terms
   - 30% deposit upon contract signing
   - 40% upon equipment delivery
   - 30% upon system acceptance

2. Warranty
   - 1-year parts and labor warranty
   - Extended warranty options available

3. Service Level Agreement
   - 24/7 emergency support
   - 4-hour response time for critical issues
   - Regular maintenance schedule

4. Change Orders
   - All changes must be in writing
   - Additional costs will be quoted separately
   - Schedule impact will be assessed

5. Insurance
   - General liability: $2,000,000
   - Workers compensation: Statutory
   - Professional liability: $1,000,000"""

    def _generate_payment_schedule(self) -> str:
        """
        Generate a payment schedule.
        """
        return """Payment Schedule

1. Contract Signing: 30%
2. Equipment Delivery: 40%
3. System Acceptance: 30%

Payment Methods Accepted:
- Bank Transfer
- Certified Check
- Credit Card (3% processing fee)"""

    def _generate_timeline(self) -> str:
        """
        Generate a project timeline.
        """
        return """Project Timeline

Week 1-2: Design and Engineering
- System design finalization
- Equipment selection
- Permit applications

Week 3-4: Procurement
- Equipment ordering
- Material preparation
- Subcontractor coordination

Week 5-8: Installation
- Equipment installation
- System integration
- Testing and commissioning

Week 9: Training and Handover
- Operator training
- System documentation
- Final acceptance testing

Week 10: Project Closeout
- As-built documentation
- Warranty registration
- Final inspection""" 