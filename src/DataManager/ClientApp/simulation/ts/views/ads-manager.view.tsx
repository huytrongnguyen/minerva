import { useEffect, useState } from 'react';
import { DataModel, Grid, GridColumn } from 'rosie-ui';

import { afterProcessing } from 'minerva/core';
import { CampaignGenerationModel, CampaignInfo, CampaignInfoStore } from 'simulation/core';

export function AdsManagerView() {
  const [selectedCampaigns, setSelectedCampaigns] = useState<CampaignInfo[]>([]), // For bulk actions
        [showModal, setShowModal] = useState(false);

  useEffect(() => {
    CampaignInfoStore.loadWithSplashScreen();
  }, []);

  async function bulkGenerate() {
    const campaigns = await CampaignGenerationModel.fetch();
    afterProcessing();
    console.log({campaigns});
    CampaignInfoStore.loadData(campaigns);
  };

  function openNew() {}

  function openEdit(id: number) {}

  function toggleActive(id: number) {}

  function deleteCampaign(id: number) {}

  return <>
    <ol className="breadcrumb">
      <li className="breadcrumb-item active">Ads Manager</li>
      <div className="ms-auto">
        <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => { bulkGenerate() }}>
          <span className="fa fa-circle-plus me-1" /> Generate
        </button>
        <button className="btn btn-sm btn-outline-secondary me-1" disabled={selectedCampaigns.length === 0}>
          <span className="fa fa-pause me-1" /> Pause Selected Campaign
        </button>
        <button className="btn btn-sm btn-outline-secondary" onClick={() => { openNew() }}>
          <span className="fa fa-plus me-1" /> Create Campaign
        </button>
      </div>
    </ol>
    <main className="fullscreen">
      <Grid fitScreen store={CampaignInfoStore}>
        <GridColumn headerName="Actions" field="id" style={{width:150}} renderer={(id: number, record: DataModel<CampaignInfo>) => {
          return <>
            <span role="button" className="text-primary text-decoration-underline" onClick={() => { openEdit(id) }}>
              Edit
            </span>
            <span role="button" className="text-primary text-decoration-underline" onClick={() => { toggleActive(id) }}>
              Pause
            </span>
            <span role="button" className="text-primary text-decoration-underline" onClick={() => { deleteCampaign(id) }}>
              Delete
            </span>
          </>
        }} />
        <GridColumn headerName="Objective" field="objective" style={{width:150}} />
        <GridColumn headerName="Campaign Name" field="campaignName" style={{width:450}} />
        <GridColumn headerName="Status" field="status" style={{width:100}} />
        <GridColumn headerName="Budget" field="budget" style={{width:100}} />
        <GridColumn headerName="Start" field="startTime" style={{width:100}} renderer={(value: string) => Date.parseDate(value).format()} />
        <GridColumn headerName="End" field="endTime" style={{width:100}} renderer={(value: string) => Date.parseDate(value).format()} />
      </Grid>
      {/* Modal (FB-Style Creation Flow) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 max-h-96 overflow-y-auto">
            {/* <h2 className="text-xl font-bold mb-4 text-white">{editingCampaign ? "Edit Campaign" : "Create New Campaign"}</h2> */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Objective</label>
                {/* <select value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value as any })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="APP_INSTALLS">App Installs</option>
                  <option value="CONVERSIONS">Conversions</option>
                  <option value="TRAFFIC">Traffic</option>
                </select> */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Platform</label>
                {/* <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as any })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="facebook_ads">Facebook</option>
                  <option value="google_ads">Google</option>
                  <option value="tiktok_ads">TikTok</option>
                </select> */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Campaign Name</label>
                {/* <input type="text" value={form.campaignName} onChange={(e) => setForm({ ...form, campaignName: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., RPG Hero Launch Q4" /> */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Budget Type</label>
                {/* <select value={form.budgetType} onChange={(e) => setForm({ ...form, budgetType: e.target.value as any })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="DAILY">Daily Budget</option>
                  <option value="LIFETIME">Lifetime Budget</option>
                </select> */}
              </div>
              {/* <input type="number" value={form.dailyBudgetUsd || form.lifetimeBudgetUsd || 5000} onChange={(e) => setForm({ ...form, [form.budgetType === "DAILY" ? "dailyBudgetUsd" : "lifetimeBudgetUsd"]: Number(e.target.value) })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Budget USD" min="0" step="0.01" /> */}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md">Cancel</button>
              {/* <button onClick={saveCampaign} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Save Campaign</button> */}
            </div>
          </div>
        </div>
      )}
    </main>
  </>
}