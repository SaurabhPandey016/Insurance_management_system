'use client';

import React from 'react';
import { Shield, Github, Linkedin, Mail, Phone, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900/60 text-slate-400 font-sans py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-900/40">
          {/* Logo & Tagline */}
          <div className="md:col-span-6 flex flex-col space-y-3.5">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Shield className="h-6 w-6 text-indigo-500 fill-indigo-500/10" />
              <span className="text-lg font-bold text-white tracking-wide">
                Insura<span className="text-indigo-400">Shield</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Automating insurance workflows. Secure customer profiles, policy issuances, claims verifications, and instant premium billing.
            </p>
          </div>

          {/* Quick Contact Links */}
          <div className="md:col-span-6 flex flex-col md:items-end justify-center space-y-4">
            <div className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Connect With Developer
            </div>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <a
                href="https://github.com/SaurabhPandey016"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 hover:text-white transition bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-lg text-xs"
              >
                <Github className="h-3.5 w-3.5 text-slate-300" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/saurabhpandey-/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 hover:text-white transition bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-lg text-xs"
              >
                <Linkedin className="h-3.5 w-3.5 text-indigo-400" />
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:developersaurabh04@gmail.com"
                className="flex items-center space-x-1.5 hover:text-white transition bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-lg text-xs"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-450" />
                <span>Email</span>
              </a>
              <a
                href="tel:+918720026790"
                className="flex items-center space-x-1.5 hover:text-white transition bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-1.5 rounded-lg text-xs"
              >
                <Phone className="h-3.5 w-3.5 text-violet-400" />
                <span>+91 8720026790</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Quote */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} InsuraShield. All rights reserved.</p>
          <div className="flex items-center space-x-1 mt-4 sm:mt-0 font-medium bg-slate-900/40 border border-slate-900 px-4 py-1.5 rounded-full text-slate-400 shadow-inner">
            <span>Made with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>by</span>
            <span className="text-white hover:text-indigo-400 transition font-bold cursor-default ml-0.5">Saurabh pandey</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
