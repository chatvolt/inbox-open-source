"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ColorDemo() {
    return (
        <div className="p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Paleta de Cores Customizada</CardTitle>
                    <CardDescription>
                        Demonstração das cores customizadas integradas com shadcn/ui
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Primary Colors */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Primary Colors</h3>
                        <div className="flex flex-wrap gap-2">
                            <div className="bg-primary-50 text-primary-950 px-3 py-2 rounded">primary-50</div>
                            <div className="bg-primary-100 text-primary-900 px-3 py-2 rounded">primary-100</div>
                            <div className="bg-primary-200 text-primary-800 px-3 py-2 rounded">primary-200</div>
                            <div className="bg-primary-300 text-primary-700 px-3 py-2 rounded">primary-300</div>
                            <div className="bg-primary-400 text-primary-100 px-3 py-2 rounded">primary-400</div>
                            <div className="bg-primary-500 text-primary-50 px-3 py-2 rounded">primary-500</div>
                            <div className="bg-primary-600 text-primary-50 px-3 py-2 rounded">primary-600</div>
                            <div className="bg-primary-700 text-primary-100 px-3 py-2 rounded">primary-700</div>
                            <div className="bg-primary-800 text-primary-200 px-3 py-2 rounded">primary-800</div>
                            <div className="bg-primary-900 text-primary-300 px-3 py-2 rounded">primary-900</div>
                            <div className="bg-primary-950 text-primary-400 px-3 py-2 rounded">primary-950</div>
                        </div>
                    </div>

                    {/* Secondary Colors */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Secondary Colors</h3>
                        <div className="flex flex-wrap gap-2">
                            <div className="bg-secondary-50 text-secondary-950 px-3 py-2 rounded">secondary-50</div>
                            <div className="bg-secondary-100 text-secondary-900 px-3 py-2 rounded">secondary-100</div>
                            <div className="bg-secondary-200 text-secondary-800 px-3 py-2 rounded">secondary-200</div>
                            <div className="bg-secondary-300 text-secondary-700 px-3 py-2 rounded">secondary-300</div>
                            <div className="bg-secondary-400 text-secondary-100 px-3 py-2 rounded">secondary-400</div>
                            <div className="bg-secondary-500 text-secondary-50 px-3 py-2 rounded">secondary-500</div>
                            <div className="bg-secondary-600 text-secondary-50 px-3 py-2 rounded">secondary-600</div>
                            <div className="bg-secondary-700 text-secondary-100 px-3 py-2 rounded">secondary-700</div>
                            <div className="bg-secondary-800 text-secondary-200 px-3 py-2 rounded">secondary-800</div>
                            <div className="bg-secondary-900 text-secondary-300 px-3 py-2 rounded">secondary-900</div>
                            <div className="bg-secondary-950 text-secondary-400 px-3 py-2 rounded">secondary-950</div>
                        </div>
                    </div>

                    {/* Accent Colors */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Accent Colors</h3>
                        <div className="flex flex-wrap gap-2">
                            <div className="bg-accent-50 text-accent-950 px-3 py-2 rounded">accent-50</div>
                            <div className="bg-accent-100 text-accent-900 px-3 py-2 rounded">accent-100</div>
                            <div className="bg-accent-200 text-accent-800 px-3 py-2 rounded">accent-200</div>
                            <div className="bg-accent-300 text-accent-700 px-3 py-2 rounded">accent-300</div>
                            <div className="bg-accent-400 text-accent-100 px-3 py-2 rounded">accent-400</div>
                            <div className="bg-accent-500 text-accent-50 px-3 py-2 rounded">accent-500</div>
                            <div className="bg-accent-600 text-accent-50 px-3 py-2 rounded">accent-600</div>
                            <div className="bg-accent-700 text-accent-100 px-3 py-2 rounded">accent-700</div>
                            <div className="bg-accent-800 text-accent-200 px-3 py-2 rounded">accent-800</div>
                            <div className="bg-accent-900 text-accent-300 px-3 py-2 rounded">accent-900</div>
                            <div className="bg-accent-950 text-accent-400 px-3 py-2 rounded">accent-950</div>
                        </div>
                    </div>

                    {/* shadcn/ui Components */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">shadcn/ui Components</h3>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="default">Primary Button</Button>
                            <Button variant="secondary">Secondary Button</Button>
                            <Button variant="outline">Outline Button</Button>
                            <Button variant="ghost">Ghost Button</Button>
                            <Button variant="destructive">Destructive Button</Button>
                        </div>
                    </div>

                    {/* Badges */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Badges</h3>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="default">Default</Badge>
                            <Badge variant="secondary">Secondary</Badge>
                            <Badge variant="outline">Outline</Badge>
                            <Badge variant="destructive">Destructive</Badge>
                        </div>
                    </div>

                    {/* Text Colors */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Text Colors</h3>
                        <div className="space-y-2">
                            <p className="text-text-900">text-text-900 - Texto principal</p>
                            <p className="text-text-700">text-text-700 - Texto secundário</p>
                            <p className="text-text-500">text-text-500 - Texto terciário</p>
                            <p className="text-primary-600">text-primary-600 - Texto primário</p>
                            <p className="text-secondary-600">text-secondary-600 - Texto secundário</p>
                            <p className="text-accent-600">text-accent-600 - Texto de destaque</p>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}