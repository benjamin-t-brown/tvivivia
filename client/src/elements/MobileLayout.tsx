import { useResizeRender } from 'hooks';
import React from 'react';
import { useActionData, useNavigation } from 'react-router-dom';
import styled from 'styled-components';

const Root = styled.div<Object>(() => {
  return {
    position: 'fixed',
    left: '0px',
    top: '0px',
    width: '100%',
    height: 'calc(100% - 62px)',
    display: 'flex',
    justifyContent: 'center',
    overflow: 'auto',
  };
});

const InnerRoot = styled.div<{ useBoxShadow?: boolean }>(props => {
  return {
    maxWidth: '800px',
    boxSizing: 'border-box',
    width: window.innerWidth - 20,
    boxShadow: props.useBoxShadow
      ? '0px 0px 16px 0px rgba(0,0,0,0.75)'
      : 'unset',
  };
});

const MobileLayout = (
  props: React.PropsWithChildren & {
    topBar?: boolean;
    useBoxShadow?: boolean;
    renderWhileLoading?: boolean;
  }
) => {
  const navigation = useNavigation();
  useResizeRender();

  return (
    <Root
      id="content-root"
      style={{
        top: props.topBar ? '55px' : '0px',
      }}
    >
      <InnerRoot useBoxShadow={props.useBoxShadow}>
        {props.renderWhileLoading || navigation.state === 'idle' ? (
          props.children
        ) : (
          <div></div>
        )}
        {/* A little space on the bottom */}
        <div
          style={{
            height: '32px',
          }}
        ></div>
      </InnerRoot>
    </Root>
  );
};

export default MobileLayout;
