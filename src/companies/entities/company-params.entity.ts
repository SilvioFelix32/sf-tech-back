export type Environment = 'PRODUCTION' | 'HOMOLOGATION';

export class CompanyParams {
  id?: string;
  company_id: string;
  environment?: Environment | null;
  url_banner?: string;
  url_site?: string;
  url_facebook?: string;
  url_instagram?: string;
  url_linkedin?: string;
  obs_email?: string | null;
  obs_voucher?: string | null;
  privacy_policy?: string | null;

  created_at?: Date | string;
  updated_at?: Date | string;
}
