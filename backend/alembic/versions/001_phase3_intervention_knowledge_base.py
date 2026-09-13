"""Phase 3 Intervention Knowledge Base Migration

Revision ID: 001_phase3_interventions
Revises: 
Create Date: 2026-09-13
"""
from alembic import op
import sqlalchemy as sa

revision = '001_phase3_interventions'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Extend recommendations table with Phase 3 engineering and reference metadata
    with op.batch_alter_table('recommendations') as batch_op:
        batch_op.add_column(sa.Column('intervention_category', sa.String(100), server_default='operational_optimization', nullable=True))
        batch_op.add_column(sa.Column('supported_sectors', sa.JSON(), server_default='[]', nullable=True))
        batch_op.add_column(sa.Column('supported_processes', sa.JSON(), server_default='[]', nullable=True))
        batch_op.add_column(sa.Column('supported_equipment', sa.JSON(), server_default='[]', nullable=True))
        batch_op.add_column(sa.Column('applicable_problem_types', sa.JSON(), server_default='[]', nullable=True))
        batch_op.add_column(sa.Column('objective_tags', sa.JSON(), server_default='[]', nullable=True))
        batch_op.add_column(sa.Column('prerequisites', sa.JSON(), server_default='{}', nullable=True))
        batch_op.add_column(sa.Column('required_telemetry', sa.JSON(), server_default='[]', nullable=True))
        batch_op.add_column(sa.Column('optional_telemetry', sa.JSON(), server_default='[]', nullable=True))
        batch_op.add_column(sa.Column('contraindications', sa.JSON(), server_default='[]', nullable=True))
        batch_op.add_column(sa.Column('implementation_constraints', sa.JSON(), server_default='[]', nullable=True))
        batch_op.add_column(sa.Column('capex_model', sa.JSON(), server_default='{}', nullable=True))
        batch_op.add_column(sa.Column('opex_model', sa.JSON(), server_default='{}', nullable=True))
        batch_op.add_column(sa.Column('savings_model', sa.JSON(), server_default='{}', nullable=True))
        batch_op.add_column(sa.Column('carbon_reduction_model', sa.JSON(), server_default='{}', nullable=True))
        batch_op.add_column(sa.Column('waste_reduction_model', sa.JSON(), server_default='{}', nullable=True))
        batch_op.add_column(sa.Column('revenue_model', sa.JSON(), server_default='{}', nullable=True))
        batch_op.add_column(sa.Column('implementation_complexity', sa.String(50), server_default='Medium', nullable=True))
        batch_op.add_column(sa.Column('operational_disruption', sa.String(50), server_default='Low', nullable=True))
        batch_op.add_column(sa.Column('risk_level', sa.String(50), server_default='Low', nullable=True))
        batch_op.add_column(sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True))
        batch_op.add_column(sa.Column('reference_type', sa.String(100), server_default='Case Study', nullable=True))
        batch_op.add_column(sa.Column('reference_title', sa.String(255), server_default='', nullable=True))
        batch_op.add_column(sa.Column('reference_organization', sa.String(150), server_default='BEE / UNIDO', nullable=True))
        batch_op.add_column(sa.Column('reference_url_or_document', sa.String(255), server_default='', nullable=True))
        batch_op.add_column(sa.Column('reference_year', sa.Integer(), server_default='2023', nullable=True))
        batch_op.add_column(sa.Column('reference_parameter', sa.String(150), server_default='', nullable=True))
        batch_op.add_column(sa.Column('reference_parameter_range', sa.String(100), server_default='', nullable=True))
        batch_op.add_column(sa.Column('reference_applicability_notes', sa.Text(), server_default='', nullable=True))
        batch_op.add_column(sa.Column('methodology_version', sa.String(50), server_default='1.0.0', nullable=True))
        batch_op.add_column(sa.Column('knowledge_version', sa.String(50), server_default='2024.1', nullable=True))
        batch_op.add_column(sa.Column('effective_date', sa.String(50), server_default='2024-01-01', nullable=True))

def downgrade():
    # Reverse schema extension by removing added Phase 3 columns
    with op.batch_alter_table('recommendations') as batch_op:
        batch_op.drop_column('effective_date')
        batch_op.drop_column('knowledge_version')
        batch_op.drop_column('methodology_version')
        batch_op.drop_column('reference_applicability_notes')
        batch_op.drop_column('reference_parameter_range')
        batch_op.drop_column('reference_parameter')
        batch_op.drop_column('reference_year')
        batch_op.drop_column('reference_url_or_document')
        batch_op.drop_column('reference_organization')
        batch_op.drop_column('reference_title')
        batch_op.drop_column('reference_type')
        batch_op.drop_column('is_active')
        batch_op.drop_column('risk_level')
        batch_op.drop_column('operational_disruption')
        batch_op.drop_column('implementation_complexity')
        batch_op.drop_column('revenue_model')
        batch_op.drop_column('waste_reduction_model')
        batch_op.drop_column('carbon_reduction_model')
        batch_op.drop_column('savings_model')
        batch_op.drop_column('opex_model')
        batch_op.drop_column('capex_model')
        batch_op.drop_column('implementation_constraints')
        batch_op.drop_column('contraindications')
        batch_op.drop_column('optional_telemetry')
        batch_op.drop_column('required_telemetry')
        batch_op.drop_column('prerequisites')
        batch_op.drop_column('objective_tags')
        batch_op.drop_column('applicable_problem_types')
        batch_op.drop_column('supported_equipment')
        batch_op.drop_column('supported_processes')
        batch_op.drop_column('supported_sectors')
        batch_op.drop_column('intervention_category')

