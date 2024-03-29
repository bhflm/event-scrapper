export const CONTRACT_ADDRESS = '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9'

export const feeCollectorABI = [
  'constructor(address _owner)',
  'error InvalidAmount()',
  'error NativeAssetTransferFailed()',
  'error NativeValueWithERC()',
  'error NewOwnerMustNotBeSelf()',
  'error NoNullOwner()',
  'error NoPendingOwnershipTransfer()',
  'error NoTransferToNullAddress()',
  'error NotPendingOwner()',
  'error NullAddrIsNotAnERC20Token()',
  'error TransferFailure()',
  'error Unauthorized(address)',
  'event FeesCollected(address indexed _token, address indexed _integrator, uint256 _integratorFee, uint256 _lifiFee)',
  'event FeesWithdrawn(address indexed _token, address indexed _to, uint256 _amount)',
  'event LiFiFeesWithdrawn(address indexed _token, address indexed _to, uint256 _amount)',
  'event OwnershipTransferRequested(address indexed _from, address indexed _to)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
  'function batchWithdrawIntegratorFees(address[] tokenAddresses)',
  'function batchWithdrawLifiFees(address[] tokenAddresses)',
  'function cancelOnwershipTransfer()',
  'function collectNativeFees(uint256 integratorFee, uint256 lifiFee, address integratorAddress) payable',
  'function collectTokenFees(address tokenAddress, uint256 integratorFee, uint256 lifiFee, address integratorAddress)',
  'function confirmOwnershipTransfer()',
  'function getLifiTokenBalance(address tokenAddress) view returns (uint256)',
  'function getTokenBalance(address integratorAddress, address tokenAddress) view returns (uint256)',
  'function owner() view returns (address)',
  'function pendingOwner() view returns (address)',
  'function transferOwnership(address _newOwner)',
  'function withdrawIntegratorFees(address tokenAddress)',
  'function withdrawLifiFees(address tokenAddress)',
]
