import { PublicProcessPageTemplate } from '../PublicProcessPageTemplate';

export default function PublicDemandProcess() {
  return (
    <PublicProcessPageTemplate
      processName="Demand Planning & Forecasting"
      processCode="P013"
      criticality="HIGH"
      category="Supply Chain"
      cycletime="Monthly"
      description="Statistical and collaborative demand forecasting driving production and procurement planning"
      flowSteps={[
        { label: 'History', description: 'Analyze historical sales with seasonality' },
        { label: 'Forecast', description: 'Statistical forecasting using time series methods' },
        { label: 'Demand Plan', description: 'Build consensus demand by product/region' },
        { label: 'Supply Plan', description: 'Develop material and capacity plan' },
        { label: 'Scenarios', description: 'Analyze upside/downside demand variations' },
        { label: 'Release', description: 'Release plan to drive MPS and MRP' }
      ]}
      moduleMappings={[
        {
          module: 'Planning',
          forms: ['Historical Sales', 'Sales Forecast', 'Demand Plan', 'Supply Plan'],
          impact: 'Demand planning inputs and outputs'
        },
        {
          module: 'Analytics',
          forms: ['Forecast Model', 'Forecast Accuracy', 'MAPE Calculation', 'Forecast Error'],
          impact: 'Forecasting analytics and accuracy'
        },
        {
          module: 'Sales',
          forms: ['Promotional Input', 'Demand Signal', 'Seasonal Adjustment', 'Market Input'],
          impact: 'Sales and market inputs to forecasting'
        },
        {
          module: 'Finance',
          forms: ['Revenue Forecast', 'Cost Forecast', 'Cash Flow Forecast'],
          impact: 'Financial forecasting'
        }
      ]}
      keyBenefits={[
        'Forecast accuracy maintained at 91%+',
        'Planning cycle time of 30 days',
        'MAPE reduced to 7.2%',
        'Demand signals captured at 94%',
        'Promotional uplift accuracy at 98.5%',
        'Seasonal pattern matching at 96%'
      ]}
      glAccounts={['GL-4000', 'GL-5000']}
    />
  );
}
