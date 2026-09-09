import { FlowchartNode } from './FlowchartNode';
import { FlowchartArrow } from './FlowchartArrow';

export function EnhancedSkinHealthFlowchart() {
  return (
    <div className="w-full max-w-7xl mx-auto p-8 bg-white">
      <div className="flex flex-col items-center space-y-6">
        
        {/* Start */}
        <FlowchartNode type="start">
          User Opens App
        </FlowchartNode>
        
        <FlowchartArrow direction="down" />
        
        {/* User Profile Check */}
        <FlowchartNode type="decision">
          Has User Profile?
        </FlowchartNode>
        
        <div className="flex items-center space-x-12">
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="left" label="No" />
            <FlowchartNode type="process">
              Create Profile
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              Health Questionnaire:<br/>
              Age, Skin Type, Medical History,<br/>
              Allergies, Lifestyle
            </FlowchartNode>
            <FlowchartArrow direction="right" />
          </div>
          
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="down" label="Yes" />
            <FlowchartNode type="process">
              Load User Profile<br/>
              & Health Data
            </FlowchartNode>
          </div>
        </div>
        
        <FlowchartArrow direction="down" />
        
        {/* Main Dashboard */}
        <FlowchartNode type="process">
          Main Dashboard<br/>
          Health Analytics, Reminders,<br/>
          Progress Tracking
        </FlowchartNode>
        
        <FlowchartArrow direction="down" />
        
        {/* Main Decision Point */}
        <FlowchartNode type="decision">
          Choose Service
        </FlowchartNode>
        
        {/* Three Main Paths */}
        <div className="flex space-x-16">
          
          {/* Skincare Consultation Path */}
          <div className="flex flex-col items-center space-y-4">
            <FlowchartArrow direction="left" label="Skincare" />
            <FlowchartNode type="process">
              Skincare Consultation
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="decision">
              Generic or Ayurvedic?
            </FlowchartNode>
            <div className="flex space-x-8 mt-4">
              <div className="flex flex-col items-center space-y-2">
                <FlowchartArrow direction="left" label="Generic" />
                <FlowchartNode type="process">
                  Modern Skincare<br/>
                  Scientific Approach
                </FlowchartNode>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <FlowchartArrow direction="right" label="Ayurvedic" />
                <FlowchartNode type="process">
                  Traditional Remedies<br/>
                  Natural Approach
                </FlowchartNode>
              </div>
            </div>
          </div>
          
          {/* Skin Disease Detection Path */}
          <div className="flex flex-col items-center space-y-4">
            <FlowchartArrow direction="down" label="Disease Detection" />
            <FlowchartNode type="process">
              Skin Disease Detection
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              Upload Skin Image
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              AI Image Analysis<br/>
              Disease Recognition
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="decision">
              Disease Detected?
            </FlowchartNode>
            <div className="flex space-x-8 mt-4">
              <div className="flex flex-col items-center space-y-2">
                <FlowchartArrow direction="left" label="Yes" />
                <FlowchartNode type="process">
                  Disease Classification<br/>
                  Severity Assessment
                </FlowchartNode>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <FlowchartArrow direction="right" label="No" />
                <FlowchartNode type="process">
                  Healthy Skin<br/>
                  Prevention Tips
                </FlowchartNode>
              </div>
            </div>
          </div>
          
          {/* Dashboard & Analytics Path */}
          <div className="flex flex-col items-center space-y-4">
            <FlowchartArrow direction="right" label="Dashboard" />
            <FlowchartNode type="process">
              Health Dashboard
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              View Analytics<br/>
              Progress Reports
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              Manage Reminders<br/>
              Treatment Schedule
            </FlowchartNode>
          </div>
        </div>
        
        {/* Merge Point */}
        <div className="flex items-center justify-center space-x-8 mt-12">
          <FlowchartArrow direction="right" className="rotate-45" />
          <FlowchartArrow direction="down" />
          <FlowchartArrow direction="left" className="-rotate-45" />
        </div>
        
        <FlowchartNode type="process">
          Generate Personalized Plan
        </FlowchartNode>
        
        <FlowchartArrow direction="down" />
        
        {/* Treatment & Diet Plan */}
        <div className="grid grid-cols-3 gap-8 mt-8">
          <FlowchartNode type="process">
            Treatment Recommendations<br/>
            Modern & Traditional Remedies
          </FlowchartNode>
          <FlowchartNode type="process">
            Personalized Diet Plan<br/>
            Based on Condition
          </FlowchartNode>
          <FlowchartNode type="process">
            Lifestyle Modifications<br/>
            Exercise & Habits
          </FlowchartNode>
        </div>
        
        <FlowchartArrow direction="down" />
        
        <FlowchartNode type="decision">
          Save to Profile?
        </FlowchartNode>
        
        <div className="flex items-center space-x-16">
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="left" label="Yes" />
            <FlowchartNode type="process">
              Update Health Profile<br/>
              Add to History
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              Set Reminders<br/>
              Treatment Schedule
            </FlowchartNode>
          </div>
          
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="right" label="No" />
            <FlowchartNode type="process">
              Temporary Session<br/>
              No Tracking
            </FlowchartNode>
          </div>
        </div>
        
        <FlowchartArrow direction="down" />
        
        {/* Monitoring & Follow-up */}
        <FlowchartNode type="process">
          Progress Monitoring
        </FlowchartNode>
        
        <FlowchartArrow direction="down" />
        
        <FlowchartNode type="decision">
          Follow-up Required?
        </FlowchartNode>
        
        <div className="flex items-center space-x-16">
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="left" label="Yes" />
            <FlowchartNode type="process">
              Schedule Check-up<br/>
              Update Treatment
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              Continuous Monitoring<br/>
              Analytics Update
            </FlowchartNode>
          </div>
          
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="right" label="Treatment Complete" />
            <FlowchartNode type="process">
              Mark as Resolved<br/>
              Archive Case
            </FlowchartNode>
          </div>
        </div>
        
        <FlowchartArrow direction="down" />
        
        {/* Notification System */}
        <FlowchartNode type="process">
          Notification System<br/>
          Reminders, Updates, Alerts
        </FlowchartNode>
        
        <FlowchartArrow direction="down" />
        
        <FlowchartNode type="decision">
          Continue or Exit?
        </FlowchartNode>
        
        <div className="flex items-center space-x-16">
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="left" label="Continue" />
            <FlowchartNode type="process">
              Return to Dashboard
            </FlowchartNode>
            <div className="mt-4 transform rotate-180">
              <FlowchartArrow direction="down" />
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="right" label="Exit" />
            <FlowchartNode type="end">
              End Session<br/>
              Data Saved
            </FlowchartNode>
          </div>
        </div>
      </div>
      
      {/* Enhanced Legend */}
      <div className="mt-16 p-8 bg-gray-50 rounded-lg">
        <h3 className="mb-6">Enhanced Skin Health Platform Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Core Features */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="mb-3 text-blue-700">Disease Detection</h4>
            <ul className="space-y-1 text-sm text-blue-600">
              <li>• AI-powered image analysis</li>
              <li>• Disease classification</li>
              <li>• Severity assessment</li>
              <li>• Early detection alerts</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="mb-3 text-green-700">Personalized Diet</h4>
            <ul className="space-y-1 text-sm text-green-600">
              <li>• Condition-based nutrition</li>
              <li>• Anti-inflammatory foods</li>
              <li>• Supplement recommendations</li>
              <li>• Meal planning</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="mb-3 text-purple-700">Smart Reminders</h4>
            <ul className="space-y-1 text-sm text-purple-600">
              <li>• Treatment schedules</li>
              <li>• Medication alerts</li>
              <li>• Follow-up appointments</li>
              <li>• Progress check-ins</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="mb-3 text-orange-700">Health Dashboard</h4>
            <ul className="space-y-1 text-sm text-orange-600">
              <li>• Progress analytics</li>
              <li>• Treatment history</li>
              <li>• Skin health trends</li>
              <li>• Recovery metrics</li>
            </ul>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <FlowchartNode type="start" className="scale-75">Start</FlowchartNode>
            <span className="text-sm">Start/End Points</span>
          </div>
          <div className="flex items-center space-x-2">
            <FlowchartNode type="process" className="scale-75">Process</FlowchartNode>
            <span className="text-sm">Process/Action</span>
          </div>
          <div className="flex items-center space-x-2">
            <FlowchartNode type="decision" className="scale-75">Decision</FlowchartNode>
            <span className="text-sm">Decision Point</span>
          </div>
          <div className="flex items-center space-x-2">
            <FlowchartNode type="end" className="scale-75">End</FlowchartNode>
            <span className="text-sm">End Point</span>
          </div>
        </div>
      </div>
      
      {/* Data Flow Information */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
        <h3 className="mb-4 text-blue-800">Data Security & Privacy</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="mb-2 text-blue-700">Medical Data</h4>
            <p className="text-blue-600">All health information is encrypted and stored securely in compliance with healthcare data protection standards.</p>
          </div>
          <div>
            <h4 className="mb-2 text-green-700">Image Processing</h4>
            <p className="text-green-600">Skin images are processed using secure AI models and can be deleted after analysis upon user request.</p>
          </div>
          <div>
            <h4 className="mb-2 text-purple-700">User Consent</h4>
            <p className="text-purple-600">Users maintain full control over their data with options to export, modify, or delete their health information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}