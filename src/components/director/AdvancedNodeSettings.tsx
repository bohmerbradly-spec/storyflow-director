import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Sliders, 
  Palette, 
  Camera, 
  Lightbulb, 
  User, 
  Image, 
  Video, 
  Volume2, 
  FileText, 
  Package, 
  Mountain, 
  Shirt, 
  MapPin, 
  Sun, 
  Film, 
  Clapperboard,
  Zap,
  Eye,
  Target,
  Layers,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Node {
  id: string;
  type: string;
  title: string;
  description: string;
  x: number;
  y: number;
  connections: string[];
  status: 'idle' | 'processing' | 'complete' | 'error';
  thumbnail?: string;
  preview?: string;
  metadata?: any;
  layer?: number;
  sceneId?: string;
}

interface AdvancedNodeSettingsProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<Node>) => void;
}

export const AdvancedNodeSettings: React.FC<AdvancedNodeSettingsProps> = ({
  node,
  isOpen,
  onClose,
  onUpdateNode
}) => {
  const [localMetadata, setLocalMetadata] = useState(node?.metadata || {});

  if (!isOpen || !node) return null;

  const updateMetadata = (key: string, value: any) => {
    const newMetadata = { ...localMetadata, [key]: value };
    setLocalMetadata(newMetadata);
    onUpdateNode(node.id, { metadata: newMetadata });
  };

  const renderImageNodeSettings = () => (
    <Tabs defaultValue="generation" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="generation">Generation</TabsTrigger>
        <TabsTrigger value="enhancement">Enhancement</TabsTrigger>
        <TabsTrigger value="editing">Editing</TabsTrigger>
        <TabsTrigger value="export">Export</TabsTrigger>
      </TabsList>

      <TabsContent value="generation" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI Generation Settings
            </CardTitle>
            <CardDescription>Configure Nano Banana image generation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Model Selection</Label>
              <Select value={localMetadata.model || 'gemini-2.5-flash-image-preview'}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.5-flash-image-preview">Gemini 2.5 Flash (Nano Banana)</SelectItem>
                  <SelectItem value="dalle-3">DALL-E 3</SelectItem>
                  <SelectItem value="midjourney">Midjourney</SelectItem>
                  <SelectItem value="stable-diffusion">Stable Diffusion XL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prompt</Label>
              <Textarea 
                placeholder="Detailed image generation prompt..."
                value={localMetadata.prompt || ''}
                onChange={(e) => updateMetadata('prompt', e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width</Label>
                <Select value={localMetadata.width || '1024'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512px</SelectItem>
                    <SelectItem value="768">768px</SelectItem>
                    <SelectItem value="1024">1024px</SelectItem>
                    <SelectItem value="1536">1536px</SelectItem>
                    <SelectItem value="2048">2048px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <Select value={localMetadata.height || '1024'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512px</SelectItem>
                    <SelectItem value="768">768px</SelectItem>
                    <SelectItem value="1024">1024px</SelectItem>
                    <SelectItem value="1536">1536px</SelectItem>
                    <SelectItem value="2048">2048px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Creativity Level: {localMetadata.creativity || 0.7}</Label>
              <Slider
                value={[localMetadata.creativity || 0.7]}
                onValueChange={([value]) => updateMetadata('creativity', value)}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Style Consistency Seed</Label>
              <Input 
                type="number"
                placeholder="12345678"
                value={localMetadata.seed || ''}
                onChange={(e) => updateMetadata('seed', e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                checked={localMetadata.hyperRealistic || false}
                onCheckedChange={(checked) => updateMetadata('hyperRealistic', checked)}
              />
              <Label>Hyper-realistic mode</Label>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="enhancement" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Image Enhancement</CardTitle>
            <CardDescription>Post-processing and refinement options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Upscaling Factor: {localMetadata.upscaling || 1}x</Label>
              <Slider
                value={[localMetadata.upscaling || 1]}
                onValueChange={([value]) => updateMetadata('upscaling', value)}
                max={4}
                min={1}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Noise Reduction: {localMetadata.noiseReduction || 0}</Label>
              <Slider
                value={[localMetadata.noiseReduction || 0]}
                onValueChange={([value]) => updateMetadata('noiseReduction', value)}
                max={100}
                min={0}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Sharpening: {localMetadata.sharpening || 0}</Label>
              <Slider
                value={[localMetadata.sharpening || 0]}
                onValueChange={([value]) => updateMetadata('sharpening', value)}
                max={100}
                min={0}
                step={5}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="editing" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Inpainting & Editing</CardTitle>
            <CardDescription>Advanced image editing with Nano Banana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Editing Mode</Label>
              <Select value={localMetadata.editMode || 'inpaint'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inpaint">Inpainting</SelectItem>
                  <SelectItem value="outpaint">Outpainting</SelectItem>
                  <SelectItem value="replace">Object Replacement</SelectItem>
                  <SelectItem value="style">Style Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Edit Instruction</Label>
              <Textarea 
                placeholder="Describe what you want to change or add..."
                value={localMetadata.editInstruction || ''}
                onChange={(e) => updateMetadata('editInstruction', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Edit Strength: {localMetadata.editStrength || 0.8}</Label>
              <Slider
                value={[localMetadata.editStrength || 0.8]}
                onValueChange={([value]) => updateMetadata('editStrength', value)}
                max={1}
                min={0.1}
                step={0.1}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="export" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
            <CardDescription>Configure output format and quality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={localMetadata.format || 'png'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (Lossless)</SelectItem>
                  <SelectItem value="jpg">JPEG (Compressed)</SelectItem>
                  <SelectItem value="webp">WebP (Modern)</SelectItem>
                  <SelectItem value="tiff">TIFF (Professional)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quality: {localMetadata.quality || 95}%</Label>
              <Slider
                value={[localMetadata.quality || 95]}
                onValueChange={([value]) => updateMetadata('quality', value)}
                max={100}
                min={60}
                step={5}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const renderCharacterNodeSettings = () => (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="personality">Personality</TabsTrigger>
        <TabsTrigger value="codex">Codex</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Character Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  value={localMetadata.fullName || node.title}
                  onChange={(e) => updateMetadata('fullName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input 
                  type="number"
                  value={localMetadata.age || ''}
                  onChange={(e) => updateMetadata('age', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Background Story</Label>
              <Textarea 
                placeholder="Rich character backstory and history..."
                value={localMetadata.backgroundStory || ''}
                onChange={(e) => updateMetadata('backgroundStory', e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input 
                  value={localMetadata.occupation || ''}
                  onChange={(e) => updateMetadata('occupation', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input 
                  value={localMetadata.nationality || ''}
                  onChange={(e) => updateMetadata('nationality', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Physical Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Hair Color</Label>
                <Select value={localMetadata.hairColor || 'black'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="brown">Brown</SelectItem>
                    <SelectItem value="blonde">Blonde</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                    <SelectItem value="white">White</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Eye Color</Label>
                <Select value={localMetadata.eyeColor || 'brown'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brown">Brown</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="hazel">Hazel</SelectItem>
                    <SelectItem value="gray">Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Build</Label>
                <Select value={localMetadata.build || 'average'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slim">Slim</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="athletic">Athletic</SelectItem>
                    <SelectItem value="muscular">Muscular</SelectItem>
                    <SelectItem value="heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Distinctive Features</Label>
              <Textarea 
                placeholder="Scars, tattoos, unique characteristics..."
                value={localMetadata.distinctiveFeatures || ''}
                onChange={(e) => updateMetadata('distinctiveFeatures', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Height: {localMetadata.height || 170}cm</Label>
              <Slider
                value={[localMetadata.height || 170]}
                onValueChange={([value]) => updateMetadata('height', value)}
                max={220}
                min={140}
                step={1}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="personality" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personality Traits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Extroversion: {localMetadata.extroversion || 50}</Label>
                <Slider
                  value={[localMetadata.extroversion || 50]}
                  onValueChange={([value]) => updateMetadata('extroversion', value)}
                  max={100}
                  min={0}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Agreeableness: {localMetadata.agreeableness || 50}</Label>
                <Slider
                  value={[localMetadata.agreeableness || 50]}
                  onValueChange={([value]) => updateMetadata('agreeableness', value)}
                  max={100}
                  min={0}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Conscientiousness: {localMetadata.conscientiousness || 50}</Label>
                <Slider
                  value={[localMetadata.conscientiousness || 50]}
                  onValueChange={([value]) => updateMetadata('conscientiousness', value)}
                  max={100}
                  min={0}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Emotional Stability: {localMetadata.emotionalStability || 50}</Label>
                <Slider
                  value={[localMetadata.emotionalStability || 50]}
                  onValueChange={([value]) => updateMetadata('emotionalStability', value)}
                  max={100}
                  min={0}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Openness: {localMetadata.openness || 50}</Label>
                <Slider
                  value={[localMetadata.openness || 50]}
                  onValueChange={([value]) => updateMetadata('openness', value)}
                  max={100}
                  min={0}
                  step={1}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="codex" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Character Codex</CardTitle>
            <CardDescription>Consistency data for AI generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Reference Seed</Label>
              <Input 
                value={localMetadata.referenceSeed || ''}
                onChange={(e) => updateMetadata('referenceSeed', e.target.value)}
                placeholder="Unique seed for consistent generation"
              />
            </div>

            <div className="space-y-2">
              <Label>Base Prompt Template</Label>
              <Textarea 
                value={localMetadata.basePromptTemplate || ''}
                onChange={(e) => updateMetadata('basePromptTemplate', e.target.value)}
                placeholder="Template prompt for consistent character generation across angles and emotions..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Import Codex
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export Codex
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  const getNodeIcon = () => {
    const iconMap = {
      character: User,
      image: Image,
      video: Video,
      audio: Volume2,
      script: FileText,
      prop: Package,
      background: Mountain,
      wardrobe: Shirt,
      location: MapPin,
      lighting: Lightbulb,
      weather: Sun,
      finalcut: Film,
      timeline: Clapperboard
    };
    const IconComponent = iconMap[node.type as keyof typeof iconMap] || Settings;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card rounded-2xl shadow-2xl border-2 border-primary/20 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center gap-3">
            {getNodeIcon()}
            <div>
              <h2 className="text-2xl font-bold text-foreground">{node.title}</h2>
              <p className="text-muted-foreground">{node.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          {node.type === 'image' && renderImageNodeSettings()}
          {node.type === 'character' && renderCharacterNodeSettings()}
          {/* Add more node type renderers here */}
          
          {/* Default settings for other node types */}
          {!['image', 'character'].includes(node.type) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getNodeIcon()}
                  {node.type.charAt(0).toUpperCase() + node.type.slice(1)} Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Advanced settings for {node.type} nodes coming soon...
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Node Title</Label>
                    <Input 
                      value={node.title}
                      onChange={(e) => onUpdateNode(node.id, { title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={node.description}
                      onChange={(e) => onUpdateNode(node.id, { description: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-border bg-muted/20">
          <div className="flex gap-2">
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};