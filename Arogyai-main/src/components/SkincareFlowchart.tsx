import { FlowchartNode } from './FlowchartNode';
import { FlowchartArrow } from './FlowchartArrow';

export function SkincareFlowchart() {
  return (
    <div className="w-full max-w-6xl mx-auto p-8 bg-white">
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
        
        <div className="flex items-center space-x-8">
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="left" label="No" />
            <FlowchartNode type="process">
              Create Profile
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              Fill Skin Type, <br/>Concerns, Preferences
            </FlowchartNode>
            <FlowchartArrow direction="right" />
          </div>
          
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="down" label="Yes" />
            <FlowchartNode type="process">
              Load User Profile
            </FlowchartNode>
          </div>
        </div>
        
        <FlowchartArrow direction="down" />
        
        {/* Main Menu */}
        <FlowchartNode type="process">
          Main Dashboard
        </FlowchartNode>
        
        <FlowchartArrow direction="down" />
        
        {/* Decision Point - Skincare Type */}
        <FlowchartNode type="decision">
          Choose Skincare Type
        </FlowchartNode>
        
        {/* Two Paths - Generic and Ayurvedic */}
        <div className="flex space-x-32">
          {/* Generic Path */}
          <div className="flex flex-col items-center space-y-4">
            <FlowchartArrow direction="left" label="Generic" />
            <FlowchartNode type="process">
              Generic Skincare AI
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              Modern Products, <br/>Scientific Approach
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              Start Chat Session
            </FlowchartNode>
          </div>
          
          {/* Ayurvedic Path */}
          <div className="flex flex-col items-center space-y-4">
            <FlowchartArrow direction="right" label="Ayurvedic" />
            <FlowchartNode type="process">
              Ayurvedic Skincare AI
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              Natural Remedies, <br/>Traditional Approach
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              Start Chat Session
            </FlowchartNode>
          </div>
        </div>
        
        {/* Merge paths */}
        <div className="flex items-center justify-center space-x-16 mt-8">
          <FlowchartArrow direction="right" className="rotate-45" />
          <FlowchartArrow direction="left" className="-rotate-45" />
        </div>
        
        <FlowchartNode type="process">
          AI Chat Interface
        </FlowchartNode>
        
        <FlowchartArrow direction="down" />
        
        <FlowchartNode type="process">
          Get Personalized <br/>Recommendations
        </FlowchartNode>
        
        <FlowchartArrow direction="down" />
        
        <FlowchartNode type="decision">
          Save Chat?
        </FlowchartNode>
        
        <div className="flex items-center space-x-16">
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="left" label="Yes" />
            <FlowchartNode type="process">
              Save to Chat History
            </FlowchartNode>
          </div>
          
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="right" label="No" />
            <FlowchartNode type="process">
              Session Ends
            </FlowchartNode>
          </div>
        </div>
        
        <FlowchartArrow direction="down" />
        
        <FlowchartNode type="decision">
          Continue or <br/>View History?
        </FlowchartNode>
        
        <div className="flex items-center space-x-16">
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="left" label="View History" />
            <FlowchartNode type="process">
              Saved Chats List
            </FlowchartNode>
            <FlowchartArrow direction="down" />
            <FlowchartNode type="process">
              Select & Resume Chat
            </FlowchartNode>
          </div>
          
          <div className="flex flex-col items-center">
            <FlowchartArrow direction="right" label="New Session" />
            <FlowchartNode type="process">
              Return to Dashboard
            </FlowchartNode>
          </div>
        </div>
        
        <FlowchartArrow direction="down" />
        
        <FlowchartNode type="end">
          End Session
        </FlowchartNode>
      </div>
      
      {/* Legend */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="mb-4">Flowchart Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <FlowchartNode type="start" className="scale-75">Start</FlowchartNode>
            <span>Start/End Points</span>
          </div>
          <div className="flex items-center space-x-2">
            <FlowchartNode type="process" className="scale-75">Process</FlowchartNode>
            <span>Process/Action</span>
          </div>
          <div className="flex items-center space-x-2">
            <FlowchartNode type="decision" className="scale-75">Decision</FlowchartNode>
            <span>Decision Point</span>
          </div>
          <div className="flex items-center space-x-2">
            <FlowchartNode type="end" className="scale-75">End</FlowchartNode>
            <span>End Point</span>
          </div>
        </div>
      </div>
    </div>
  );
}