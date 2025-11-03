export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      academic_rankings: {
        Row: {
          created_at: string | null
          id: string
          institution_name: string
          rank_position: number | null
          ranking_system: string
          subject_area: string | null
          year: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          institution_name: string
          rank_position?: number | null
          ranking_system: string
          subject_area?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          institution_name?: string
          rank_position?: number | null
          ranking_system?: string
          subject_area?: string | null
          year?: number | null
        }
        Relationships: []
      }
      approval_workflow_steps: {
        Row: {
          automation_criteria: Json | null
          can_be_automated: boolean | null
          created_at: string | null
          estimated_duration_days: number | null
          id: string
          required_for_org_types:
            | Database["public"]["Enums"]["organization_type"][]
            | null
          step_description: string | null
          step_name: string
          step_number: number
        }
        Insert: {
          automation_criteria?: Json | null
          can_be_automated?: boolean | null
          created_at?: string | null
          estimated_duration_days?: number | null
          id?: string
          required_for_org_types?:
            | Database["public"]["Enums"]["organization_type"][]
            | null
          step_description?: string | null
          step_name: string
          step_number: number
        }
        Update: {
          automation_criteria?: Json | null
          can_be_automated?: boolean | null
          created_at?: string | null
          estimated_duration_days?: number | null
          id?: string
          required_for_org_types?:
            | Database["public"]["Enums"]["organization_type"][]
            | null
          step_description?: string | null
          step_name?: string
          step_number?: number
        }
        Relationships: []
      }
      authorization_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          hospital_id: string | null
          id: string
          midnight_tx_hash: string | null
          performed_by: string | null
          target_organization_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          hospital_id?: string | null
          id?: string
          midnight_tx_hash?: string | null
          performed_by?: string | null
          target_organization_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          hospital_id?: string | null
          id?: string
          midnight_tx_hash?: string | null
          performed_by?: string | null
          target_organization_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "authorization_audit_log_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "authorization_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "authorization_audit_log_target_organization_id_fkey"
            columns: ["target_organization_id"]
            isOneToOne: false
            referencedRelation: "research_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "authorization_audit_log_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_data_access_requests: {
        Row: {
          agreement_end_date: string | null
          agreement_start_date: string | null
          approved_permissions: string[] | null
          created_at: string | null
          data_access_conditions: string[] | null
          data_retention_period: number | null
          data_security_plan: string | null
          ethics_committee: string | null
          expected_outcomes: string | null
          gdpr_compliance_confirmed: boolean | null
          hipaa_compliance_confirmed: boolean | null
          hospital_decision: string | null
          hospital_decision_date: string | null
          hospital_decision_reason: string | null
          hospital_id: string | null
          hospital_reviewer: string | null
          id: string
          intended_use_case: string
          irb_approval_date: string | null
          irb_approval_number: string | null
          monitoring_requirements: string[] | null
          organization_id: string | null
          publication_plans: string | null
          renewable: boolean | null
          request_type: string | null
          requested_by: string | null
          requested_permissions: string[]
          research_description: string | null
          research_methodology: string | null
          research_title: string | null
          status: Database["public"]["Enums"]["approval_workflow_status"] | null
          updated_at: string | null
        }
        Insert: {
          agreement_end_date?: string | null
          agreement_start_date?: string | null
          approved_permissions?: string[] | null
          created_at?: string | null
          data_access_conditions?: string[] | null
          data_retention_period?: number | null
          data_security_plan?: string | null
          ethics_committee?: string | null
          expected_outcomes?: string | null
          gdpr_compliance_confirmed?: boolean | null
          hipaa_compliance_confirmed?: boolean | null
          hospital_decision?: string | null
          hospital_decision_date?: string | null
          hospital_decision_reason?: string | null
          hospital_id?: string | null
          hospital_reviewer?: string | null
          id?: string
          intended_use_case: string
          irb_approval_date?: string | null
          irb_approval_number?: string | null
          monitoring_requirements?: string[] | null
          organization_id?: string | null
          publication_plans?: string | null
          renewable?: boolean | null
          request_type?: string | null
          requested_by?: string | null
          requested_permissions: string[]
          research_description?: string | null
          research_methodology?: string | null
          research_title?: string | null
          status?:
            | Database["public"]["Enums"]["approval_workflow_status"]
            | null
          updated_at?: string | null
        }
        Update: {
          agreement_end_date?: string | null
          agreement_start_date?: string | null
          approved_permissions?: string[] | null
          created_at?: string | null
          data_access_conditions?: string[] | null
          data_retention_period?: number | null
          data_security_plan?: string | null
          ethics_committee?: string | null
          expected_outcomes?: string | null
          gdpr_compliance_confirmed?: boolean | null
          hipaa_compliance_confirmed?: boolean | null
          hospital_decision?: string | null
          hospital_decision_date?: string | null
          hospital_decision_reason?: string | null
          hospital_id?: string | null
          hospital_reviewer?: string | null
          id?: string
          intended_use_case?: string
          irb_approval_date?: string | null
          irb_approval_number?: string | null
          monitoring_requirements?: string[] | null
          organization_id?: string | null
          publication_plans?: string | null
          renewable?: boolean | null
          request_type?: string | null
          requested_by?: string | null
          requested_permissions?: string[]
          research_description?: string | null
          research_methodology?: string | null
          research_title?: string | null
          status?:
            | Database["public"]["Enums"]["approval_workflow_status"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hospital_data_access_requests_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_data_access_requests_hospital_reviewer_fkey"
            columns: ["hospital_reviewer"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_data_access_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "research_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_data_access_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_organization_agreements: {
        Row: {
          agreement_type: string | null
          created_at: string | null
          data_retention_months: number | null
          data_scope: string[] | null
          effective_date: string | null
          expiration_date: string | null
          hospital_id: string | null
          id: string
          is_active: boolean | null
          max_studies_per_year: number | null
          midnight_agreement_proof: string | null
          midnight_tx_hash: string | null
          organization_id: string | null
          permissions: string[]
          requested_by: string | null
          requires_irb_approval: boolean | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string | null
        }
        Insert: {
          agreement_type?: string | null
          created_at?: string | null
          data_retention_months?: number | null
          data_scope?: string[] | null
          effective_date?: string | null
          expiration_date?: string | null
          hospital_id?: string | null
          id?: string
          is_active?: boolean | null
          max_studies_per_year?: number | null
          midnight_agreement_proof?: string | null
          midnight_tx_hash?: string | null
          organization_id?: string | null
          permissions: string[]
          requested_by?: string | null
          requires_irb_approval?: boolean | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
        }
        Update: {
          agreement_type?: string | null
          created_at?: string | null
          data_retention_months?: number | null
          data_scope?: string[] | null
          effective_date?: string | null
          expiration_date?: string | null
          hospital_id?: string | null
          id?: string
          is_active?: boolean | null
          max_studies_per_year?: number | null
          midnight_agreement_proof?: string | null
          midnight_tx_hash?: string | null
          organization_id?: string | null
          permissions?: string[]
          requested_by?: string | null
          requires_irb_approval?: boolean | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hospital_organization_agreements_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_organization_agreements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "research_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_organization_agreements_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_organization_agreements_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitals: {
        Row: {
          accreditations: string[] | null
          address: Json | null
          contact_email: string | null
          created_at: string | null
          hospital_id: string
          id: string
          institution_type: string
          midnight_contract_address: string | null
          name: string
          settings: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          accreditations?: string[] | null
          address?: Json | null
          contact_email?: string | null
          created_at?: string | null
          hospital_id: string
          id?: string
          institution_type?: string
          midnight_contract_address?: string | null
          name: string
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          accreditations?: string[] | null
          address?: Json | null
          contact_email?: string | null
          created_at?: string | null
          hospital_id?: string
          id?: string
          institution_type?: string
          midnight_contract_address?: string | null
          name?: string
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      medical_studies: {
        Row: {
          condition: string
          contributing_hospitals: string[] | null
          control_count: number
          control_success: number
          created_at: string | null
          data_commitment: string | null
          description: string | null
          id: string
          midnight_proof_hash: string | null
          midnight_tx_hash: string | null
          organization_id: string | null
          p_value: number
          patient_count: number
          principal_investigator: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["study_status"] | null
          study_data: Json
          study_id: string
          submitted_by: string | null
          title: string
          treatment: string
          treatment_success: number
          updated_at: string | null
          verified_at: string | null
        }
        Insert: {
          condition: string
          contributing_hospitals?: string[] | null
          control_count: number
          control_success: number
          created_at?: string | null
          data_commitment?: string | null
          description?: string | null
          id?: string
          midnight_proof_hash?: string | null
          midnight_tx_hash?: string | null
          organization_id?: string | null
          p_value: number
          patient_count: number
          principal_investigator?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["study_status"] | null
          study_data: Json
          study_id: string
          submitted_by?: string | null
          title: string
          treatment: string
          treatment_success: number
          updated_at?: string | null
          verified_at?: string | null
        }
        Update: {
          condition?: string
          contributing_hospitals?: string[] | null
          control_count?: number
          control_success?: number
          created_at?: string | null
          data_commitment?: string | null
          description?: string | null
          id?: string
          midnight_proof_hash?: string | null
          midnight_tx_hash?: string | null
          organization_id?: string | null
          p_value?: number
          patient_count?: number
          principal_investigator?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["study_status"] | null
          study_data?: Json
          study_id?: string
          submitted_by?: string | null
          title?: string
          treatment?: string
          treatment_success?: number
          updated_at?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_studies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "research_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_studies_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_approval_workflow: {
        Row: {
          approval_decision: string | null
          assigned_reviewer: string | null
          completed_at: string | null
          conditional_approval: boolean | null
          conditions_to_meet: string[] | null
          created_at: string | null
          current_step: number | null
          decision_made_at: string | null
          decision_made_by: string | null
          decision_reason: string | null
          documents_reviewed: boolean | null
          email_domain_verified: boolean | null
          id: string
          initiated_at: string | null
          initiated_by: string | null
          manual_review_completed: boolean | null
          organization_id: string | null
          platform_admin_reviewer: string | null
          required_documents_submitted: boolean | null
          status: Database["public"]["Enums"]["approval_workflow_status"] | null
          total_steps: number | null
          updated_at: string | null
        }
        Insert: {
          approval_decision?: string | null
          assigned_reviewer?: string | null
          completed_at?: string | null
          conditional_approval?: boolean | null
          conditions_to_meet?: string[] | null
          created_at?: string | null
          current_step?: number | null
          decision_made_at?: string | null
          decision_made_by?: string | null
          decision_reason?: string | null
          documents_reviewed?: boolean | null
          email_domain_verified?: boolean | null
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          manual_review_completed?: boolean | null
          organization_id?: string | null
          platform_admin_reviewer?: string | null
          required_documents_submitted?: boolean | null
          status?:
            | Database["public"]["Enums"]["approval_workflow_status"]
            | null
          total_steps?: number | null
          updated_at?: string | null
        }
        Update: {
          approval_decision?: string | null
          assigned_reviewer?: string | null
          completed_at?: string | null
          conditional_approval?: boolean | null
          conditions_to_meet?: string[] | null
          created_at?: string | null
          current_step?: number | null
          decision_made_at?: string | null
          decision_made_by?: string | null
          decision_reason?: string | null
          documents_reviewed?: boolean | null
          email_domain_verified?: boolean | null
          id?: string
          initiated_at?: string | null
          initiated_by?: string | null
          manual_review_completed?: boolean | null
          organization_id?: string | null
          platform_admin_reviewer?: string | null
          required_documents_submitted?: boolean | null
          status?:
            | Database["public"]["Enums"]["approval_workflow_status"]
            | null
          total_steps?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_approval_workflow_assigned_reviewer_fkey"
            columns: ["assigned_reviewer"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_approval_workflow_decision_made_by_fkey"
            columns: ["decision_made_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_approval_workflow_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_approval_workflow_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "research_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_approval_workflow_platform_admin_reviewer_fkey"
            columns: ["platform_admin_reviewer"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_documents: {
        Row: {
          created_at: string | null
          document_name: string
          document_number: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          expiration_date: string | null
          file_hash: string | null
          file_path: string | null
          file_size: number | null
          id: string
          issue_date: string | null
          issuing_authority: string | null
          mime_type: string | null
          organization_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_name: string
          document_number?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          expiration_date?: string | null
          file_hash?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          mime_type?: string | null
          organization_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_name?: string
          document_number?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          expiration_date?: string | null
          file_hash?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          mime_type?: string | null
          organization_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "research_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          department: string | null
          employee_id: string | null
          end_date: string | null
          id: string
          invited_by: string | null
          is_active: boolean | null
          organization_id: string | null
          permissions: string[] | null
          role: string | null
          start_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          organization_id?: string | null
          permissions?: string[] | null
          role?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          department?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          organization_id?: string | null
          permissions?: string[] | null
          role?: string | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "research_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_verification_attempts: {
        Row: {
          automated_checks_passed: boolean | null
          completed_at: string | null
          created_at: string | null
          documents_submitted: boolean | null
          external_verifications: Json | null
          id: string
          initiated_by: string | null
          manual_review_completed: boolean | null
          organization_id: string | null
          reviewed_by: string | null
          started_at: string | null
          verification_notes: string | null
          verification_result: Database["public"]["Enums"]["verification_status"]
          verification_score: number | null
          verification_type: string
        }
        Insert: {
          automated_checks_passed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          documents_submitted?: boolean | null
          external_verifications?: Json | null
          id?: string
          initiated_by?: string | null
          manual_review_completed?: boolean | null
          organization_id?: string | null
          reviewed_by?: string | null
          started_at?: string | null
          verification_notes?: string | null
          verification_result: Database["public"]["Enums"]["verification_status"]
          verification_score?: number | null
          verification_type: string
        }
        Update: {
          automated_checks_passed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          documents_submitted?: boolean | null
          external_verifications?: Json | null
          id?: string
          initiated_by?: string | null
          manual_review_completed?: boolean | null
          organization_id?: string | null
          reviewed_by?: string | null
          started_at?: string | null
          verification_notes?: string | null
          verification_result?: Database["public"]["Enums"]["verification_status"]
          verification_score?: number | null
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_verification_attempts_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_verification_attempts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "research_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_verification_attempts_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_administrators: {
        Row: {
          admin_level: string | null
          appointed_at: string | null
          appointed_by: string | null
          can_approve_organizations: boolean | null
          can_assign_reviewers: boolean | null
          can_manage_hospitals: boolean | null
          can_review_documents: boolean | null
          created_at: string | null
          id: string
          is_active: boolean | null
          specializations: string[] | null
          user_id: string | null
        }
        Insert: {
          admin_level?: string | null
          appointed_at?: string | null
          appointed_by?: string | null
          can_approve_organizations?: boolean | null
          can_assign_reviewers?: boolean | null
          can_manage_hospitals?: boolean | null
          can_review_documents?: boolean | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          specializations?: string[] | null
          user_id?: string | null
        }
        Update: {
          admin_level?: string | null
          appointed_at?: string | null
          appointed_by?: string | null
          can_approve_organizations?: boolean | null
          can_assign_reviewers?: boolean | null
          can_manage_hospitals?: boolean | null
          can_review_documents?: boolean | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          specializations?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_administrators_appointed_by_fkey"
            columns: ["appointed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_administrators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      required_documents_by_org_type: {
        Row: {
          created_at: string | null
          description: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id: string
          is_required: boolean | null
          organization_type: Database["public"]["Enums"]["organization_type"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          id?: string
          is_required?: boolean | null
          organization_type: Database["public"]["Enums"]["organization_type"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          is_required?: boolean | null
          organization_type?: Database["public"]["Enums"]["organization_type"]
        }
        Relationships: []
      }
      research_organizations: {
        Row: {
          academic_ranking_verified: boolean | null
          accreditation_documents: string[] | null
          accreditations: string[] | null
          address: Json | null
          contact_email: string
          created_at: string | null
          description: string | null
          domain_verification: boolean | null
          ein_verification: boolean | null
          ethics_board_approval: boolean | null
          grant_history: Json | null
          id: string
          irb_approval_document: string | null
          legal_registration_proof: string | null
          midnight_org_proof: string | null
          name: string
          orcid_verified_members: number | null
          org_id: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          peer_references: string[] | null
          primary_contact_name: string | null
          primary_contact_title: string | null
          pubmed_publications: number | null
          registration_number: string | null
          research_areas: string[] | null
          tax_id: string | null
          updated_at: string | null
          verification_documents: Json | null
          verification_expires_at: string | null
          verification_level:
            | Database["public"]["Enums"]["verification_level"]
            | null
          verification_score: number | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          wallet_address: string | null
          website: string | null
          website_verification: boolean | null
        }
        Insert: {
          academic_ranking_verified?: boolean | null
          accreditation_documents?: string[] | null
          accreditations?: string[] | null
          address?: Json | null
          contact_email: string
          created_at?: string | null
          description?: string | null
          domain_verification?: boolean | null
          ein_verification?: boolean | null
          ethics_board_approval?: boolean | null
          grant_history?: Json | null
          id?: string
          irb_approval_document?: string | null
          legal_registration_proof?: string | null
          midnight_org_proof?: string | null
          name: string
          orcid_verified_members?: number | null
          org_id: string
          organization_type: Database["public"]["Enums"]["organization_type"]
          peer_references?: string[] | null
          primary_contact_name?: string | null
          primary_contact_title?: string | null
          pubmed_publications?: number | null
          registration_number?: string | null
          research_areas?: string[] | null
          tax_id?: string | null
          updated_at?: string | null
          verification_documents?: Json | null
          verification_expires_at?: string | null
          verification_level?:
            | Database["public"]["Enums"]["verification_level"]
            | null
          verification_score?: number | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          wallet_address?: string | null
          website?: string | null
          website_verification?: boolean | null
        }
        Update: {
          academic_ranking_verified?: boolean | null
          accreditation_documents?: string[] | null
          accreditations?: string[] | null
          address?: Json | null
          contact_email?: string
          created_at?: string | null
          description?: string | null
          domain_verification?: boolean | null
          ein_verification?: boolean | null
          ethics_board_approval?: boolean | null
          grant_history?: Json | null
          id?: string
          irb_approval_document?: string | null
          legal_registration_proof?: string | null
          midnight_org_proof?: string | null
          name?: string
          orcid_verified_members?: number | null
          org_id?: string
          organization_type?: Database["public"]["Enums"]["organization_type"]
          peer_references?: string[] | null
          primary_contact_name?: string | null
          primary_contact_title?: string | null
          pubmed_publications?: number | null
          registration_number?: string | null
          research_areas?: string[] | null
          tax_id?: string | null
          updated_at?: string | null
          verification_documents?: Json | null
          verification_expires_at?: string | null
          verification_level?:
            | Database["public"]["Enums"]["verification_level"]
            | null
          verification_score?: number | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          wallet_address?: string | null
          website?: string | null
          website_verification?: boolean | null
        }
        Relationships: []
      }
      study_collaborations: {
        Row: {
          authorized_by: string | null
          collaborating_organization_id: string | null
          contribution_hash: string | null
          contribution_type: string | null
          id: string
          joined_at: string | null
          study_id: string | null
        }
        Insert: {
          authorized_by?: string | null
          collaborating_organization_id?: string | null
          contribution_hash?: string | null
          contribution_type?: string | null
          id?: string
          joined_at?: string | null
          study_id?: string | null
        }
        Update: {
          authorized_by?: string | null
          collaborating_organization_id?: string | null
          contribution_hash?: string | null
          contribution_type?: string | null
          id?: string
          joined_at?: string | null
          study_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_collaborations_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_collaborations_collaborating_organization_id_fkey"
            columns: ["collaborating_organization_id"]
            isOneToOne: false
            referencedRelation: "research_organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_collaborations_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "medical_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_institutional_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          institution_name: string
          institution_type: Database["public"]["Enums"]["organization_type"]
          is_active: boolean | null
          notes: string | null
          verification_date: string | null
          verification_level:
            | Database["public"]["Enums"]["verification_level"]
            | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          institution_name: string
          institution_type: Database["public"]["Enums"]["organization_type"]
          is_active?: boolean | null
          notes?: string | null
          verification_date?: string | null
          verification_level?:
            | Database["public"]["Enums"]["verification_level"]
            | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          institution_name?: string
          institution_type?: Database["public"]["Enums"]["organization_type"]
          is_active?: boolean | null
          notes?: string | null
          verification_date?: string | null
          verification_level?:
            | Database["public"]["Enums"]["verification_level"]
            | null
          verified_by?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          credentials: Json | null
          department: string | null
          email: string
          first_name: string | null
          id: string
          institution: string | null
          is_active: boolean | null
          last_name: string | null
          orcid_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          settings: Json | null
          title: string | null
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          credentials?: Json | null
          department?: string | null
          email: string
          first_name?: string | null
          id: string
          institution?: string | null
          is_active?: boolean | null
          last_name?: string | null
          orcid_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          settings?: Json | null
          title?: string | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          credentials?: Json | null
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          institution?: string | null
          is_active?: boolean | null
          last_name?: string | null
          orcid_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          settings?: Json | null
          title?: string | null
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_approval_workflow: {
        Args: {
          new_status: Database["public"]["Enums"]["approval_workflow_status"]
          reviewer_id: string
          workflow_id: string
        }
        Returns: boolean
      }
      calculate_verification_score: {
        Args: { org_id: string }
        Returns: number
      }
      check_required_documents_submitted: {
        Args: { org_id: string }
        Returns: boolean
      }
      get_required_documents: {
        Args: { org_type: Database["public"]["Enums"]["organization_type"] }
        Returns: {
          description: string
          document_type: Database["public"]["Enums"]["document_type"]
          is_required: boolean
        }[]
      }
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected" | "suspended"
      approval_workflow_status:
        | "draft"
        | "documents_required"
        | "documents_submitted"
        | "documents_under_review"
        | "documents_approved"
        | "platform_review"
        | "approved"
        | "rejected"
        | "suspended"
      document_status:
        | "uploaded"
        | "under_review"
        | "approved"
        | "rejected"
        | "expired"
      document_type:
        | "institutional_registration"
        | "irb_ethics_approval"
        | "research_license"
        | "tax_exempt_certificate"
        | "accreditation_certificate"
        | "insurance_certificate"
        | "principal_investigator_cv"
        | "organization_charter"
        | "financial_audit"
        | "data_security_certificate"
      organization_type:
        | "university"
        | "research_institute"
        | "biotech_company"
        | "pharmaceutical"
        | "government_agency"
        | "ngo"
      study_status: "draft" | "submitted" | "verified" | "published"
      user_role: "public" | "org_admin" | "hospital_admin" | "super_admin"
      verification_level: "basic" | "standard" | "premium" | "institutional"
      verification_status:
        | "unverified"
        | "pending"
        | "documents_pending"
        | "manual_review"
        | "verified"
        | "rejected"
        | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: ["pending", "approved", "rejected", "suspended"],
      approval_workflow_status: [
        "draft",
        "documents_required",
        "documents_submitted",
        "documents_under_review",
        "documents_approved",
        "platform_review",
        "approved",
        "rejected",
        "suspended",
      ],
      document_status: [
        "uploaded",
        "under_review",
        "approved",
        "rejected",
        "expired",
      ],
      document_type: [
        "institutional_registration",
        "irb_ethics_approval",
        "research_license",
        "tax_exempt_certificate",
        "accreditation_certificate",
        "insurance_certificate",
        "principal_investigator_cv",
        "organization_charter",
        "financial_audit",
        "data_security_certificate",
      ],
      organization_type: [
        "university",
        "research_institute",
        "biotech_company",
        "pharmaceutical",
        "government_agency",
        "ngo",
      ],
      study_status: ["draft", "submitted", "verified", "published"],
      user_role: ["public", "org_admin", "hospital_admin", "super_admin"],
      verification_level: ["basic", "standard", "premium", "institutional"],
      verification_status: [
        "unverified",
        "pending",
        "documents_pending",
        "manual_review",
        "verified",
        "rejected",
        "suspended",
      ],
    },
  },
} as const
