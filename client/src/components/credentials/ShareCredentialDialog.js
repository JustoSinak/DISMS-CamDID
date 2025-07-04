import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Check, Copy, Share2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useIdentity } from '../../contexts/IdentityContext';
import { useWeb3 } from '../../contexts/Web3Context';
import { QRCodeSVG } from 'qrcode.react';

const ShareCredentialDialog = ({ credential, onClose, open }) => {
  const { shareCredential, error } = useIdentity();
  const { account } = useWeb3();
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setRecipient('');
      setShareLink(null);
      setCopied(false);
    }
  }, [open]);

  const handleShare = async () => {
    try {
      setLoading(true);
      const result = await shareCredential(credential.id, recipient);
      setShareLink(result.shareLink);
    } catch (err) {
      console.error('Error sharing credential:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
                  <Share2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Share Credential
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Share this credential with another user. They will need to enter their encryption key to view it.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Input
                  label="Recipient DID"
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter recipient's DID"
                  required
                  disabled={!!shareLink}
                />

                {shareLink && (
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-center">
                      <QRCodeSVG
                        value={shareLink}
                        size={256}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="secondary"
                        onClick={copyToClipboard}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {copied ? 'Copied!' : 'Copy Link'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => window.open(shareLink, '_blank')}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      The recipient will need to enter their encryption key to view this credential.
                    </p>
                  </div>
                )}

                <div className="mt-5 sm:mt-6">
                  <Button
                    variant="primary"
                    onClick={handleShare}
                    disabled={loading || !recipient || !!shareLink}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                    ) : (
                      'Share Credential'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ShareCredentialDialog;
