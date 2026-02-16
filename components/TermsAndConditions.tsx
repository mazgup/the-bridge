import React from 'react';
import { GlassCard } from './GlassCard';
import { ScrollText, Shield, AlertCircle, Mail, FileText, Scale } from 'lucide-react';

export const TermsAndConditions: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
            <header className="mb-8">
                <h1 className="text-4xl font-serif text-bridge-slate mb-2">Terms & Conditions</h1>
                <p className="text-slate-500">Last updated: February 2026</p>
            </header>

            <div className="space-y-6">
                {/* Introduction */}
                <GlassCard>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-bridge-slate/10 rounded-xl">
                            <ScrollText size={24} className="text-bridge-slate" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-bridge-slate mb-3">1. Introduction</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                Welcome to The Bridge ("Platform", "we", "our", "us"). By accessing or using The Bridge, 
                                you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any 
                                part of these terms, you may not access the Platform.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                The Bridge is a career acceleration platform designed to support professionals in reaching 
                                their career goals through CV optimization, interview preparation, job matching, and 
                                career re-entry support services.
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* Service Description */}
                <GlassCard>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-bridge-sage/20 rounded-xl">
                            <FileText size={24} className="text-bridge-slate" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-bridge-slate mb-3">2. Service Description</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                The Bridge provides the following services:
                            </p>
                            <ul className="space-y-2 text-slate-600">
                                <li className="flex gap-2">
                                    <span className="text-bridge-sage">•</span>
                                    <span><strong>CV Studio:</strong> AI-powered CV building and auditing tools</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-bridge-sage">•</span>
                                    <span><strong>Interview Simulation Lab:</strong> Practice interviews with AI feedback</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-bridge-sage">•</span>
                                    <span><strong>Opportunity Radar:</strong> Job matching based on your profile</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-bridge-sage">•</span>
                                    <span><strong>Re:Turn Hub:</strong> Specialized support for career returners</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </GlassCard>

                {/* User Responsibilities */}
                <GlassCard>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-100 rounded-xl">
                            <AlertCircle size={24} className="text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-bridge-slate mb-3">3. User Responsibilities</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                By using The Bridge, you agree to:
                            </p>
                            <ul className="space-y-2 text-slate-600">
                                <li className="flex gap-2">
                                    <span className="text-amber-500">•</span>
                                    Provide accurate and truthful information in your CV and profile
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-amber-500">•</span>
                                    Use the Platform only for lawful purposes related to career development
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-amber-500">•</span>
                                    Not share your account credentials with others
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-amber-500">•</span>
                                    Not attempt to reverse-engineer or exploit Platform features
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-amber-500">•</span>
                                    Acknowledge that AI-generated content is advisory and should be reviewed before use
                                </li>
                            </ul>
                        </div>
                    </div>
                </GlassCard>

                {/* Privacy & Data */}
                <GlassCard>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Shield size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-bridge-slate mb-3">4. Privacy & Data Protection</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                We are committed to protecting your privacy. Your data is handled in accordance with 
                                applicable data protection laws including GDPR.
                            </p>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h4 className="font-bold text-blue-800 mb-2">Data We Collect:</h4>
                                <ul className="space-y-1 text-sm text-slate-600">
                                    <li>• CV and career information you provide</li>
                                    <li>• Simulation and interview practice data</li>
                                    <li>• Usage analytics to improve services</li>
                                    <li>• Account information for authentication</li>
                                </ul>
                            </div>
                            <p className="text-slate-600 leading-relaxed mt-4">
                                Your CV data is processed by AI systems to provide personalized recommendations. 
                                We do not sell your personal data to third parties. You may request deletion of 
                                your data at any time.
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* AI Disclaimer */}
                <GlassCard>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Scale size={24} className="text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-bridge-slate mb-3">5. AI-Generated Content Disclaimer</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                The Bridge uses artificial intelligence to generate CV suggestions, interview questions, 
                                feedback, and career advice. Please note:
                            </p>
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-4">
                                <ul className="space-y-2 text-sm text-slate-700">
                                    <li className="flex gap-2">
                                        <span className="font-bold text-purple-600">1.</span>
                                        AI-generated content is advisory and should be reviewed before use
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-purple-600">2.</span>
                                        We do not guarantee employment outcomes or interview success
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-purple-600">3.</span>
                                        Job market information may not reflect real-time conditions
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="font-bold text-purple-600">4.</span>
                                        You are responsible for verifying all information before submission to employers
                                    </li>
                                </ul>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                                The Platform is a tool to assist your career development journey, not a replacement 
                                for professional career counseling or legal advice.
                            </p>
                        </div>
                    </div>
                </GlassCard>

                {/* Subscription & Payment */}
                <GlassCard>
                    <h2 className="text-xl font-bold text-bridge-slate mb-3">6. Subscription & Payment</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        The Bridge operates on a subscription basis. By subscribing, you agree to:
                    </p>
                    <ul className="space-y-2 text-slate-600 mb-4">
                        <li>• Automatic renewal unless cancelled before the billing date</li>
                        <li>• Cancellation can be done at any time through your account settings</li>
                        <li>• Refunds are provided in accordance with our refund policy</li>
                        <li>• Price changes will be communicated 30 days in advance</li>
                    </ul>
                </GlassCard>

                {/* Limitation of Liability */}
                <GlassCard>
                    <h2 className="text-xl font-bold text-bridge-slate mb-3">7. Limitation of Liability</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        To the maximum extent permitted by law, The Bridge shall not be liable for:
                    </p>
                    <ul className="space-y-2 text-slate-600">
                        <li>• Any indirect, incidental, or consequential damages</li>
                        <li>• Loss of employment opportunities or income</li>
                        <li>• Errors or inaccuracies in AI-generated content</li>
                        <li>• Service interruptions or data loss</li>
                        <li>• Actions taken based on Platform recommendations</li>
                    </ul>
                </GlassCard>

                {/* Modifications */}
                <GlassCard>
                    <h2 className="text-xl font-bold text-bridge-slate mb-3">8. Modifications to Terms</h2>
                    <p className="text-slate-600 leading-relaxed">
                        We reserve the right to modify these Terms at any time. Material changes will be 
                        communicated via email or Platform notification at least 14 days before taking effect. 
                        Continued use of the Platform after changes constitutes acceptance of the modified Terms.
                    </p>
                </GlassCard>

                {/* Contact */}
                <GlassCard>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-bridge-sage/20 rounded-xl">
                            <Mail size={24} className="text-bridge-slate" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-bridge-slate mb-3">9. Contact Us</h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                If you have any questions about these Terms, please contact us:
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <p className="text-slate-700 font-medium">The Bridge Support Team</p>
                                <p className="text-slate-600">Email: support@thebridge.career</p>
                                <p className="text-slate-600">Response time: Within 48 hours</p>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Footer */}
                <div className="text-center text-sm text-slate-500 pt-4">
                    <p>© 2026 The Bridge. All rights reserved.</p>
                    <p className="mt-1">By using The Bridge, you acknowledge that you have read and understood these Terms.</p>
                </div>
            </div>
        </div>
    );
};
