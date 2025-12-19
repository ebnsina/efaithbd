'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'

export type FormState =
  | 'idle'
  | 'dirty'
  | 'loading'
  | 'success'
  | 'error'
  | 'warning'

interface FormActionBarProps {
  state: FormState
  message?: string
  successMessage?: string
  errorMessage?: string
  warningMessage?: string
  loadingMessage?: string
  dirtyMessage?: string
  onReset?: () => void
  onSave?: () => void
  resetLabel?: string
  saveLabel?: string
  className?: string
  onAnimationComplete?: () => void
}

const stateConfig = {
  idle: {
    icon: null,
    message: '',
    bgColor: '',
    textColor: '',
  },
  dirty: {
    icon: null,
    message: 'Careful — you have unsaved changes!',
    bgColor: 'bg-primary',
    textColor: 'text-primary-foreground',
  },
  loading: {
    icon: Loader2,
    message: 'Saving changes...',
    bgColor: 'bg-primary',
    textColor: 'text-primary-foreground',
  },
  success: {
    icon: CheckCircle2,
    message: 'Changes saved successfully!',
    bgColor: 'bg-green-600',
    textColor: 'text-white',
  },
  error: {
    icon: AlertCircle,
    message: 'Failed to save changes. Please try again.',
    bgColor: 'bg-destructive',
    textColor: 'text-white',
  },
  warning: {
    icon: AlertTriangle,
    message: 'Saved with warnings.',
    bgColor: 'bg-yellow-600',
    textColor: 'text-white',
  },
}

export function FormActionBar({
  state,
  message,
  successMessage,
  errorMessage,
  warningMessage,
  loadingMessage,
  dirtyMessage,
  onReset,
  onSave,
  resetLabel = 'Reset',
  saveLabel = 'Save Changes',
  className,
  onAnimationComplete,
}: FormActionBarProps) {
  const [visibleBar, setVisibleBar] = useState<
    'none' | 'dirty' | 'loading' | 'progress'
  >('none')
  const [progressState, setProgressState] = useState<FormState>('idle')
  const prevStateRef = useRef<FormState>('idle')

  useEffect(() => {
    const prevState = prevStateRef.current
    prevStateRef.current = state

    if (state === 'idle') {
      // Only hide if we're not showing a progress animation
      if (visibleBar !== 'progress') {
        setVisibleBar('none')
      }
      // Don't reset progressState immediately - let animation complete first
    } else if (state === 'dirty') {
      setVisibleBar('dirty')
      setProgressState('idle')
    } else if (state === 'loading') {
      setProgressState('idle')
      if (prevState === 'dirty') {
        setVisibleBar('none')
        setTimeout(() => {
          setVisibleBar('loading')
        }, 300)
      } else {
        setVisibleBar('loading')
      }
    } else if (
      state === 'success' ||
      state === 'error' ||
      state === 'warning'
    ) {
      setProgressState(state)
      if (visibleBar === 'loading') {
        setVisibleBar('none')
        setTimeout(() => {
          setVisibleBar('progress')
        }, 300)
      } else {
        setVisibleBar('progress')
      }
    }
  }, [state, visibleBar])

  // Use the appropriate config based on visible bar state
  const getDirtyConfig = () => stateConfig.dirty
  const getLoadingConfig = () => stateConfig.loading
  const getProgressConfig = () => stateConfig[progressState] || stateConfig.idle

  // Get the appropriate message based on state
  let displayMessage = message || ''
  if (state === 'dirty' && dirtyMessage) displayMessage = dirtyMessage
  if (state === 'loading' && loadingMessage) displayMessage = loadingMessage

  // For progress bar states, use progressState
  if (progressState === 'success') {
    displayMessage = successMessage || stateConfig.success.message
  }
  if (progressState === 'error') {
    displayMessage = errorMessage || stateConfig.error.message
  }
  if (progressState === 'warning') {
    displayMessage = warningMessage || stateConfig.warning.message
  }

  const handleProgressComplete = () => {
    setProgressState('idle')
    setVisibleBar('none')
    if (onAnimationComplete) {
      onAnimationComplete()
    }
  }

  return (
    <div className={cn('fixed bottom-0 left-0 right-0 z-9999', className)}>
      <AnimatePresence mode="wait">
        {visibleBar === 'dirty' && (
          <motion.div
            key="dirty-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn('w-full shadow-lg', getDirtyConfig().bgColor)}
          >
            <div className="w-full px-6 lg:px-8">
              <div className="flex items-center justify-between py-5 gap-6">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-base font-medium',
                      getDirtyConfig().textColor
                    )}
                  >
                    {dirtyMessage || stateConfig.dirty.message}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {onReset && (
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={onReset}
                      className={cn(
                        'font-medium border-2 hover:bg-white/10',
                        getDirtyConfig().textColor
                      )}
                    >
                      {resetLabel}
                    </Button>
                  )}

                  {onSave && (
                    <Button
                      size="lg"
                      onClick={onSave}
                      className="font-medium bg-white text-primary hover:bg-white/90 shadow-md"
                    >
                      {saveLabel}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {visibleBar === 'loading' && (
          <motion.div
            key="loading-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn('w-full shadow-lg', getLoadingConfig().bgColor)}
          >
            <div className="w-full px-6 lg:px-8">
              <div className="flex items-center justify-center py-5 gap-3">
                <Loader2
                  className={cn(
                    'h-5 w-5 shrink-0 animate-spin',
                    getLoadingConfig().textColor
                  )}
                />
                <span
                  className={cn(
                    'text-base font-medium',
                    getLoadingConfig().textColor
                  )}
                >
                  {loadingMessage || stateConfig.loading.message}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {visibleBar === 'progress' &&
          (() => {
            const progressConfig = getProgressConfig()
            const Icon = progressConfig.icon
            return (
              <motion.div
                key="progress-bar"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={cn(
                  'w-full shadow-lg relative overflow-hidden',
                  progressConfig.bgColor
                )}
              >
                <motion.div
                  key={`progress-fill-${progressState}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 3, ease: 'linear' }}
                  onAnimationComplete={handleProgressComplete}
                  className="absolute inset-y-0 left-0 bg-white/20 origin-left"
                />

                <div className="w-full px-6 lg:px-8 relative z-10">
                  <div className="flex items-center justify-center py-5 gap-3">
                    {Icon && (
                      <Icon
                        className={cn(
                          'h-5 w-5 shrink-0',
                          progressConfig.textColor
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'text-base font-medium',
                        progressConfig.textColor
                      )}
                    >
                      {displayMessage}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })()}
      </AnimatePresence>
    </div>
  )
}
