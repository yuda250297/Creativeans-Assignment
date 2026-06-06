"use client";

export default function Footer() {
    return (
        <footer
              className="w-full mx-auto px-4 sm:px-6 lg:px-8 border-t py-6">
              <div
                  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2">
                  <div className="flex flex-col gap-4">
                      <div className="font-headline-md text-headline-md font-bold text-primary">Creativeans Marketplace</div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">© 2026 Creativeans Marketplace. All rights reserved.</p>
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-4 md:justify-end items-center">
                      <a
                          className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100"
                          href="#">Privacy Policy</a>
                      <a
                          className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100"
                          href="#">Terms of Service</a>
                      <a
                          className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-all opacity-80 hover:opacity-100"
                          href="#">Contact Support</a>
                  </div>
              </div>
        </footer>
    )
}