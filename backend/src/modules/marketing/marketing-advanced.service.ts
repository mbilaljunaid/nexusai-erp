import { Injectable } from '@nestjs/common';

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'social' | 'web';
  targetAudience: string[];
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  startDate: Date;
  endDate: Date;
  budget: number;
  templateId: string;
}

export interface DripCampaign {
  id: string;
  name: string;
  leadId: string;
  sequence: { step: number; message: string; delayDays: number }[];
  status: 'active' | 'paused' | 'completed';
  progress: number;
  nextStepDate?: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: string;
}

@Injectable()
export class MarketingAdvancedService {
  private campaigns: Map<string, Campaign> = new Map();
  private dripCampaigns: Map<string, DripCampaign> = new Map();
  private emailTemplates: Map<string, EmailTemplate> = new Map();
  private campaignCounter = 1;

  createCampaign(campaign: Campaign): Campaign {
    const id = `CAMP-${this.campaignCounter++}`;
    campaign.id = id;
    this.campaigns.set(id, campaign);
    return campaign;
  }

  launchCampaign(campaignId: string): { success: boolean; message: string } {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      return { success: false, message: 'Campaign not found' };
    }

    if (campaign.status !== 'draft') {
      return { success: false, message: 'Only draft campaigns can be launched' };
    }

    campaign.status = 'active';
    return { success: true, message: `Campaign "${campaign.name}" launched successfully` };
  }

  createDripCampaign(dripCampaign: DripCampaign): DripCampaign {
    this.dripCampaigns.set(dripCampaign.id, dripCampaign);
    return dripCampaign;
  }

  advanceDripCampaign(dripId: string): { success: boolean; nextMessage?: string } {
    const drip = this.dripCampaigns.get(dripId);
    if (!drip) {
      return { success: false };
    }

    const currentStep = drip.sequence[drip.progress];
    if (!currentStep) {
      drip.status = 'completed';
      return { success: true };
    }

    const nextStep = drip.sequence[drip.progress + 1];
    drip.progress++;

    if (nextStep) {
      drip.nextStepDate = new Date(Date.now() + nextStep.delayDays * 24 * 60 * 60 * 1000);
    }

    return { success: true, nextMessage: currentStep.message };
  }

  createEmailTemplate(template: EmailTemplate): EmailTemplate {
    this.emailTemplates.set(template.id, template);
    return template;
  }

  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.emailTemplates.get(templateId);
  }

  renderTemplate(templateId: string, variables: Record<string, string>): string {
    const template = this.emailTemplates.get(templateId);
    if (!template) return '';

    let content = template.content;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(`{{${key}}}`, value);
    }
    return content;
  }

  getCampaignMetrics(campaignId: string): {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    roi: number;
  } {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      return { impressions: 0, clicks: 0, conversions: 0, ctr: 0, roi: 0 };
    }

    // Simulated metrics
    const impressions = Math.floor(Math.random() * 10000);
    const clicks = Math.floor(impressions * 0.05);
    const conversions = Math.floor(clicks * 0.1);

    return {
      impressions,
      clicks,
      conversions,
      ctr: (clicks / impressions) * 100,
      roi: (conversions * 100 - campaign.budget) / campaign.budget * 100,
    };
  }
}
