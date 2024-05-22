import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import Navigation from '@libs/Navigation/Navigation';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {UserWallet} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import FailedKYC from './FailedKYC';
import FeesAndTerms from './FeesAndTerms/FeesAndTerms';
import PersonalInfo from './PersonalInfo/PersonalInfo';
import VerifyIdentity from './VerifyIdentity/VerifyIdentity';

type EnablePaymentsPageOnyxProps = {
    /** The user's wallet */
    userWallet: OnyxEntry<UserWallet>;
};

type EnablePaymentsPageProps = EnablePaymentsPageOnyxProps;

function EnablePaymentsPage({userWallet}: EnablePaymentsPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    useEffect(() => {
        if (isOffline) {
            return;
        }

        Wallet.openEnablePaymentsPage();
    }, [isOffline]);

    if (isEmptyObject(userWallet)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={userWallet?.currentStep !== CONST.WALLET.STEP.ONFIDO}
            includeSafeAreaPaddingBottom={false}
            testID={EnablePaymentsPage.displayName}
        >
            {() => {
                if (userWallet?.errorCode === CONST.WALLET.ERROR.KYC) {
                    return (
                        <>
                            <HeaderWithBackButton
                                title={translate('additionalDetailsStep.headerTitle')}
                                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
                            />
                            <FailedKYC />
                        </>
                    );
                }

                const currentStep = userWallet?.currentStep || CONST.WALLET.STEP.ADDITIONAL_DETAILS;

                switch (currentStep) {
                    case CONST.WALLET.STEP.ADDITIONAL_DETAILS:
                        return <PersonalInfo />;
                    case CONST.WALLET.STEP.ONFIDO:
                        return <VerifyIdentity />;
                    case CONST.WALLET.STEP.TERMS:
                        return <FeesAndTerms />;
                    default:
                        return null;
                }
            }}
        </ScreenWrapper>
    );
}

EnablePaymentsPage.displayName = 'EnablePaymentsPage';

export default withOnyx<EnablePaymentsPageProps, EnablePaymentsPageOnyxProps>({
    userWallet: {
        key: ONYXKEYS.USER_WALLET,

        // We want to refresh the wallet each time the user attempts to activate the wallet so we won't use the
        // stored values here.
        initWithStoredValues: false,
    },
})(EnablePaymentsPage);
